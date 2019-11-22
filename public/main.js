{

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