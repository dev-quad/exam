const log_error = require("./logger.js");
const env_vars = require("dotenv").config();

if(env_vars.error){
	log_error("Cannot load environment variables", env_vars.error);
	var admin = undefined;
}else{
	var { ADMIN_PASSWORD: admin } = env_vars;
}

async function verify(password){
	if(admin!==undefined && password == admin){
		return true;
	}
	return false;
}

module.exports = verify;
