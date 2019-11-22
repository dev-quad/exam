const fs = require("fs");
const path = require("path");

async function remove_user(jamb){
	return Promise((resolve, reject) => {
		fs.readFile(path.resolve(__dirname, "./db.json"), "utf8", (err, data) => {
			if(err){ 
				reject(`While reading for removal : ${err}`); 
				return;
			}
			let db = JSON.parse(data);
			let users = db.users;
			let removed;
			for(let i in users){
				if(users[i].jamb == jamb){
					removed = db.users.splice(i);
					break;
				}
			}
			db = JSON.stringify(db);
			fs.writeFile(path.resolve(__dirname, "./db.json"), db, (e) => {
				if(e){
					reject(`While writing for removal : ${e}`); 
					return;
				}
				resolve(removed);
			});
		})
	});
}

async function add_user(obj){
	return new Promise((resolve, reject) => {
		fs.readFile(path.resolve(__dirname, "./db.json"), "utf8", (err, data) => {
			if(err){
				reject(`While reading for addition : ${err}`);
				return; 
			}
			let db = JSON.parse(data);
			db.users.push(obj);
			db = JSON.stringify(db);
			fs.writeFile(path.resolve(__dirname, "./db.json"), db, (e) => {
				if(err){
					reject(`While writing for addition : ${e}`);
					return; 
				}
				resolve(true);
			})
		});
	});
}

module.exports = {
	add: add_user,
	remove: remove_user
}