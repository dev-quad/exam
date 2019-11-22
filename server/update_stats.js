const fs = require("fs");
const path = require("path");

async function update_stats(obj){
	return new Promise((resolve, reject) => {
		fs.readFile(path.resolve(__dirname, "./stats.json"), "utf8", (err, data) => {
			if(!err){
				let stats = JSON.parse(data);
				stats.sessions_run += (obj.sessions_run || 0);
				stats.last_session_time = obj.last_session_time || stats.last_session_time;
				stats.avg_time_per_session= obj.avg_time_per_session || stats.avg_time_per_session;
				stats.error_count = obj.error_count || stats.error_count;
				stats.user_count = obj.user_count || stats.user_count;
				let stats_json = JSON.stringify(stats);
				fs.writeFile(path.resolve(__dirname, "./stats.json"), stats_json, { flag: "w" }, (e) => {
					if(e){
						reject(e);
					}else{
						console.log(`Updated Stats`);
						resolve(stats_json);
					}
				});
			}else{
				reject(err);
			}
		})
	});
}

//{"sessions_active":1,"sessions_run":0,"error_count":0,"avg_time_per_session":0,"user_count":0,"last_session_time":""}
module.exports = update_stats;