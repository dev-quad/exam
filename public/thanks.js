{

	// eslint-disable-next-line no-undef
	let wow = new WOW();
	wow.init();

}

{
	let obj = {
		"0.5": "twice a day",
		"1": "once daily",
		"2": "every two days",
		"3": "every three days",
		"7": "once a week"
	};
	let email;

	async function get_frequency(){
		let err = false;
		let res = await fetch("./reg_complete").catch(() => { err=true; });
		console.log(res);
		if(err){ return ""; }
		if(res.redirected){
			window.location.href = res.url;
			return "";
		}
		let json = await res.json().catch(() => { err=true; });
		if(err){ return ""; }
		let txt = json.frequency;
		email = json.email;
		txt = String(Number(txt)/2);
		if(isNaN(txt) || Object.keys(obj).indexOf(txt)<0){ return ""; }
		return obj[txt];
	}

	(async () => {
		let el = document.getElementById("txt");
		let txt = await get_frequency();
		if(txt!=''){
			el.innerHTML = `AutoCaps will send your JAMB admission updates to <span>${email}</span> ${txt}`;
		}
	})();
}