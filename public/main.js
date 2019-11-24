{

	// eslint-disable-next-line no-undef
	let wow = new WOW();
	wow.init();


	let Toggler = function(){
		let showing = false;

		return () => {
			let eye = document.getElementById("switch").classList;
			eye.remove(showing? "fa-eye-slash" : "fa-eye");
			eye.add(showing? "fa-eye" : "fa-eye-slash");
			let pwd = document.getElementById("password");
			pwd.type = (showing? "password" : "text");
			showing = !showing;
		}
	}

	document.getElementById("switch")
		.addEventListener("click", new Toggler() );
	

}


{
	let form = document.getElementById("signup");
	let btn = document.getElementsByClassName("submit_box")[0];
	let notif = document.getElementsByClassName("notification")[0];
	let notif_text = document.getElementById("notif_text");
	let success = document.getElementById("success");
	let fail = document.getElementById("fail");

	form.onsubmit = async (e) => {
		e.preventDefault();
		if(btn.classList.contains("loading")){ return; }
		notif.classList.remove("show");
		success.classList.add("hide");
		fail.classList.remove("hide");

		let j_email = document.getElementById("jamb").value;
		let u_email = document.getElementById("email").value;
		let pwd = document.getElementById("password").value;
		let drop = Number(document.getElementById("dropdown").value);
		drop = (isNaN(drop))? 2 : drop ;


		let j_test = /^([A-Za-z0-9_.+-]+)@(([A-Za-z0-9_-]+)\.)+([A-Za-z0-9_-]{1,12})$/.test(j_email);
		let u_test = /^([A-Za-z0-9_.+-]+)@(([A-Za-z0-9_-]+)\.)+([A-Za-z0-9_-]{1,12})$/.test(u_email);
		let p_test = /^([\S]{8,99})$/.test(pwd);
		if(!(j_test && u_test && p_test)){
			console.log("input failed tests");
			notif.lastElementChild.innerHTML = "Please enter valid input";
			notif.classList.add("show");
			btn.classList.remove("loading");
			return;
		}

		btn.classList.add("loading");
		console.log("Verifying...");

		let queries = {
			jamb: j_email,//"ademorotis@gmail.com",
			email: u_email,//"leolaotan@gmail.com",
			password: pwd,//"renaissance",
			frequency: drop//2
		}
		let error = false;
		let res = await fetch("./signup", {
			method: "POST",
			headers: {
				"Content-Type": "application/json;charset=utf-8"
			},
			body: JSON.stringify(queries)
		}).catch(e => {
			console.log(`Err : ${e}`);
			notif.lastElementChild.innerHTML = "An error occurred. Please try again.";
			notif.classList.add("show");
			error = true;
			btn.classList.remove("loading");
			return;
		});
		if(error){ return; }
		if(res.redirected && res.ok){
			console.log(res);
			window.location.href = res.url;
			return;
		}
		let res_json = await res.json();
		let succeeded = {
			check: false,
			update: () => {
				succeeded.check = true;
				return "A verification code has been sent to the personal email you provided.";
			}
		}
		let txt = (res_json.jamb)? succeeded.update() : "Invalid JAMB email or password" ;
		txt = (res_json.personal)? txt : "Invalid personal email";
		console.log(`${txt} >> ${JSON.stringify(res_json)}`);

		if(succeeded.check){
			success.classList.remove("hide");
			fail.classList.add("hide");
		}

		notif_text.innerHTML = txt;
		notif.classList.add("show");

		btn.classList.remove("loading");
	}
}