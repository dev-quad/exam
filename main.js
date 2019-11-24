const express = require("express");
const app = express();
const path = require("path");
const bodyParser = require("body-parser");
const multer = require("multer"); // v1.0.5
const upload = multer();
const session = require("express-session");
const fs = require("fs");

const log_error = require("./server/logger.js");
const verify = require("./server/verify.js");

app.set("port", process.env.PORT || 8080);

app.use(express.static(__dirname + "/public"));
app.use(
  bodyParser.urlencoded({
    extended: true
  })
);
app.use(bodyParser.json());
app.use(session({
	secret: "autocapssecretapp",
	resave: false,
	saveUninitialized: false
}))

app.get("/", async (req, res) => {
  res.status(200);
  res.set("Content-Type", "text/html");
  res.send("home");
});

app.get("/admin/:password/run", async (req, res) => {
  let {
    params: { password }
  } = req;
  if (!verify(password)) {
    res.status(400);
    res.set("Content-Type", "text/plain");
    res.send("400 - Forbidden or malformed request");
    return;
  }
  async function run_session() {
    return new Promise((resolve, reject) => {
      fs.readFile(
        path.resolve(__dirname, "./server/stats.json"),
        "utf8",
        (err, data) => {
          if (!err) {
            let stats = JSON.parse(data);
            if (Number(stats.sessions_active) < 1) {
              let mailer = require("./server/mailer/mailer.js");
              stats.sessions_active += 1;
              let stats_json = JSON.stringify(stats);
              fs.writeFile(
                path.resolve(__dirname, "./server/stats.json"),
                stats_json,
                "utf8",
                e => {
                  if (e) {
                    reject(e);
                  }
                }
              );
              mailer();
              resolve(true);
            }
          } else {
            reject(err);
          }
        }
      );
    });
  }
  run_session().catch(e => {
    console.log(e);
  });
  res.status(202);
  res.set("Content-Type", "text/plain");
  res.send(`202 - Mailing session active`);
});

app.get("/admin/:password/stats", async (req, res, next) => {
  let {
    params: { password }
  } = req;
  if (!verify(password)) {
    res.status(400);
    res.set("Content-Type", "text/plain");
    res.send("400 - Forbidden or malformed request");
    return;
  }
  fs.readFile(
    path.resolve(__dirname, "./server/stats.json"),
    "utf8",
    (err, data) => {
      if (err) {
        next();
        return;
      }
      let d = JSON.parse(data);
      res.json(d);
    }
  );
});

app.get("/admin/:password/errors", async (req, res, next) => {
  let {
    params: { errors }
  } = req;
  if (!verify(errors)) {
    res.status(400);
    res.set("Content-Type", "text/plain");
    res.send("400 - Forbidden or malformed request");
    return;
  }
  fs.readFile(
    path.resolve(__dirname, "./server/error.log"),
    "utf8",
    (err, data) => {
      if (err) {
        next();
        return;
      }
      res.status(200);
      res.set("Content-Type", "text/plain");
      res.send(data);
    }
  );
});

app.post("/signup", upload.array(), async (req, res) => {
  let jamb = req.body.jamb;
  let password = req.body.password;
  let email = req.body.email; 
  let frequency = req.body.frequency;
  console.log(jamb);
  frequency =
    isNaN(frequency) || frequency > 7 || frequency < 0.5 ? 4 : frequency * 2;

  let ans = {
    jamb: true,
    personal: true
  };
  let udata = {
    jamb,
    email,
    password,
    frequency,
    count: 0
  };
  let scraper = require("./server/mailer/jamb_scraper.js");
  let mail = require("./server/mailer/mail_sender.js");

  await scraper(jamb, password).catch(e => {
    ans.jamb = false;
    console.log(`Invalid jamb : ${e}`);
    res
      .status(200)
      .type("json")
      .json(ans);
  });
  if (!ans.jamb) {
    return;
  }
  let verifyCode = [0,0,0,0,0,0].map(() => Math.floor(Math.random() * 10)).join("");
  let receipt = await mail({
    to: email,
    subject: "Verify your AutoCAPS email",
    html:
      `
<h1><p><img src="https://www.jamb.org.ng/images/banner.png" width="400px" height="42px" /></p> </h1> 
<p><h1>Your verification code is:\n` +
      verifyCode +
      `</h1>.
</p>
<hr>
<footer>
<p>Generated by: <b>AutoCAPS</b></p>
<p>Contact information: <a href="autocaps.herokuapp.com">AutoCAPS.herokuapp.com</a>.</p>
</footer><br>
<p><strong>Note:</strong> <kbd>Copyright 2019 by AutoCAPS. All Rights Reserved..</kbd></p>
`
  }).catch(e => {
    console.log(`Invalid personal : ${e}`);
    ans.personal = false;
  });
  console.log(receipt);
  if (!ans.personal) {
    res.status(200).type("json").json(ans);
  }
  if (ans.personal && ans.jamb){
		//console.log("all's well");
		console.log(verifyCode);
		req.session.user_temp_verify_code = verifyCode;
		req.session.udata = udata;
		res.redirect(302, "verify.html");
		//res.sendFile(path.join(__dirname + "/public/verify.html"));
  }
  
});

app.post("/validate", upload.array(), async function(req, res) {
  let user_code = req.body.verify;
  let actual_code = req.session.user_temp_verify_code; 
  let udata = req.session.udata;
  let users = require("./server/users.js");
  //console.log(user_code, actual_code);

  if(actual_code == undefined){
	return res.redirect(302, "index.html");
  }
  let ans = { 
	is_valid: false, 
	is_added: true, 
	is_existing: false,
	email: udata.email,	
  };

  if (user_code == actual_code){
	ans.is_valid = true;
	let new_user = await users.add(udata).catch(e => {
		log_error(`Unable to add user ${udata.jamb}`, e);
		ans.is_added = false;
	});
	if(!ans.is_added){
		return res.status(200).type("json").json(ans);
	}else if(!new_user){
		ans.is_existing = true;
		//console.log(`User ${udata.jamb} already exists`);
		return res.status(200).type("json").json(ans);
	}else{
		return res.redirect(302, "thanks.html");
	}
  }else{
	return res.status(200).type("json").json(ans);
  }
});

app.get("/reg_complete", (req, res) => {
	let udata = req.session.udata || {};
	if(!udata || !udata.frequency || isNaN(Number(udata.frequency))){
		return res.redirect(302, "index.html");
	}
	let ans = {
		frequency: udata.frequency,
		email: udata.email
	}
	res.status(200).type("text").json(ans);
	req.session.destroy();
})


/* ERROR pages */
app.use((req, res) => {
  res.status(404);
  res.set("Content-Type", "text/plain");
  res.send("404 - Page Not Found");
}); // 404

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  log_error(`500- Intenal Server Error`);
  res.status(500);
  res.set("Content-Type", "text/plain");
  res.send("500 - Internal Server Error");
}); //500

// start server
app.listen(app.get("port"), () => {
  console.log("Running AutoCaps on " + app.get("port"));
});
