const express = require("express");
const app = express();
const path = require("path");
const bodyParser = require("body-parser");
const multer = require("multer"); // v1.0.5
const upload = multer();
const fs = require("fs");
const verify = require("./server/verify.js");
var verifyCode; 
app.set("port", process.env.PORT || 8080);
app.use(express.static(__dirname+"/public"));
app.use(
  bodyParser.urlencoded({
    extended: true
  })
);
app.use(bodyParser.json());

app.get("/", async (req, res) => {
	res.status(200);
	res.set("Content-Type", "text/html");
	res.sendFile(path.join(__dirname + "/public/index.html"));
})


app.get("/admin/:password/run", async (req, res) => {
	let { params: {password} } = req;
	if(verify(password)==false){
		res.status(400);
		res.set("Content-Type", "text/plain");
		res.send("400 - Forbidden or malformed request");
		return;
	}
  console.log("stt")
	async function run_session(){
		console.log("strt")
    return new Promise((resolve, reject) => {
			console.log("start")
      fs.readFile(path.resolve(__dirname, "./server/stats.json"), "utf8", (err, data) => {
				if(!err){
					console.log("stot")
          let stats = JSON.parse(data);
          console.log("st")
					if(Number(stats.sessions_active) >= 1){
            console.log("srt")
						let mailer = require("./server/mailer/mailer.js");
            console.log("str")
						stats.sessions_active = 1;
						let stats_json = JSON.stringify(stats);
						fs.writeFile(path.resolve(__dirname, "./server/stats.json"), stats_json, "utf8", (e) => {
							if(e){ reject(e); }
						});
						mailer();
						resolve(true);
					}
				}else{ reject(err); }
			})
		})
	}
	run_session().catch((e) => { console.log(e) });
	res.status(202);
	res.set("Content-Type", "text/plain");
	res.send(`202 - Mailing session active`);
})

app.get("/admin/:password/stats", async (req, res, next) => {
	let { params: {password} } = req;
	if(!verify(password)){
		res.status(400);
		res.set("Content-Type", "text/plain");
		res.send("400 - Forbidden or malformed request");
		return;
	}
	fs.readFile(path.resolve(__dirname, "./server/stats.json"), "utf8", (err, data) => {
		if(err){
			next();
			return;
		}
		let d = JSON.parse(data);
		res.json(d);
	})
})
var arr;
app.post("/form", upload.array(), async function(req, res, next) {
  console.log(req.body)
  arr = req.body;
  var nodemailer = require("nodemailer");
  var transporter = nodemailer.createTransport({
	  service: "gmail",
	  auth: {
		  user: process.env.gmail,
		  pass: process.env.pas
	  }
  })
  verifyCode = Math.floor((Math.random() * 1000000) + 1);
  var message = {
    from: process.env.gmail, // sender address
    to: req.body.email, // receiver mail
    subject: "Verify your AutoCAPS email", // Subject line
    html: `<h1>Your code is:\n`+verifyCode+`</h1>` // plain text body
  };
  transporter.sendMail(message);
	res.status(200);
	res.set("Content-Type", "text/html");
	res.sendFile(path.join(__dirname + "/public/verify.html"));
});

app.post("/validate", upload.array(), async function(req, res, next) {
  console.log(req.body.verify);
  console.log(verifyCode);
  console.log(arr);
  if (req.body.verify==verifyCode){
    var data = JSON.parse(fs.readFileSync(process.env.pat));
    console.log(data);
    data.users.push(arr);
    console.log(data);
    fs.writeFileSync(process.env.pat, JSON.stringify(data));
    console.log("done");
	  res.sendFile(path.join(__dirname + "/public/thanks.html"));
    return "new user";
  }
  else {
	  res.sendFile(path.join(__dirname + "/public/verify.html"));
  }
});

app.get("/admin/:password/errors", async (req, res, next) => {
	let { params: {errors} } = req;
	if(!verify(errors)){
		res.status(400);
		res.set("Content-Type", "text/plain");
		res.send("400 - Forbidden or malformed request");
		return;
	}
	fs.readFile(path.resolve(__dirname, "./server/error.log"), "utf8", (err, data) => {
		if(err){
			next();
			return;
		}
		res.status(200);
		res.set("Content-Type", "text/plain");
		res.send(data);
	});
});

/* ERROR pages */
app.use((req, res) => {
	res.status(404);
	res.set("Content-Type", "text/plain");
	res.send("404 - Page Not Found");
})// 404

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
	// add_err_to_log(500);
	res.status(500);
	res.set("Content-Type", "text/plain");
	res.send("500 - Internal Server Error");
});//500

// start server
app.listen(app.get("port"), () => {
	console.log("Running AutoCaps on "+app.get("port"));
})