{

	// eslint-disable-next-line no-undef
	let wow = new WOW();
	wow.init();

}

{
	let form = document.getElementById("signup");
	let btn = document.getElementsByClassName("submit_box")[0];
	let notif = document.getElementsByClassName("notification")[0];
	let notif_text = document.getElementById("notif_text");
	let fail = document.getElementById("fail");

	form.onsubmit = async (e) => {
		e.preventDefault();
		if(btn.classList.contains("loading")){ return; }
		notif.classList.remove("show");
		fail.classList.remove("hide");

		let verify = document.getElementById("verify").value;
		let v_test =/^([\d]{6,6})$/.test(verify);
		if(!v_test){
			console.log("input failed tests");
			notif.lastElementChild.innerHTML = "Please enter a valid 6-digit code";
			notif.classList.add("show");
			return;
		}

		btn.classList.add("loading");
		console.log("Verifying...");
		
		let queries = { verify };
		let error = false;
		let res = await fetch("./validate", {
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
		})
		if(error){ return; }
		if(res.redirected && res.ok){
			btn.classList.remove("loading");
			console.log("redirected");
			window.location.href = res.url;
			return;
		}
		let res_json = await res.json().catch(() => {
			notif.lastElementChild.innerHTML = "An error occurred. Please try again.";
			notif.classList.add("show");
			error = true;
			btn.classList.remove("loading");
		});
		if(error){ return; }

		
		let txt = (res_json.is_valid)? '' : `Invalid verification code<br/>Please check your mail at <b>${res_json.email}</b>` ;
		txt = (res_json.is_added)? txt : "Sorry, we are unable to sign up this user<br/>Please try again";
		txt = (res_json.is_existing)? "This user already exists in our database" : txt;
		console.log(`${txt} >> ${JSON.stringify(res_json)}`);

		notif_text.innerHTML = txt;
		notif.classList.add("show");

		btn.classList.remove("loading");
	}
}