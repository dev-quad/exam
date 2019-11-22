const fs = require("fs");
const path = require("path");

async function log_error(msg, err){
	let t = (new Date()).toString();
	let data = `
Error at ${t}; 
Message >> ${msg}; 
Cause >> ${err};
`;
	fs.writeFileSync(path.resolve(__dirname, "./error.log"), data, { flag: "a" }, (e) => {
		console.log(`
Error logging at ${t};
Message >> ${msg};
Cause of message error >> ${err};
Cause of logging error >> ${e};
`);
	});
}

module.exports = log_error;