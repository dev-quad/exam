
async function verify(password){
	if(password == process.env.pes){
		return true;
	}
	return false;
}

module.exports = verify;
