const puppeteer = require('puppeteer');
const fs = require("fs");
const path = require("path");

async function scrape(email, pwd, dev){
	if (dev==0) {
		throw "haq"
    console.log("hi")
	}else if(dev == 1){ 
    console.log("hey")
    return true; 
  }
	const browser = await puppeteer.launch({
		args: ['--no-sandbox']
	});// if else block for development phase. do not remove.
	const page = await browser.newPage();
	await page.goto('https://www.jamb.org.ng/eFacility./');
	await page.focus('#email');
	await page.keyboard.type(email);
	await page.focus('#password')
	await page.keyboard.type(pwd);
	await page.click('#lnkLogin');
	await page.waitForSelector('#ctl00');
	await page.evaluate(() => {
		document.querySelectorAll("a[href='CAPSDirect']")[0].click();
	});
	await page.waitForNavigation({ waitUntil: 'networkidle0' })
	await page.evaluate(() => {
		document.querySelectorAll("span[class='nav-label']")[3].click();
	});
	await page.waitForNavigation({ waitUntil: 'networkidle0' });
	/*
	await page.screenshot({path: __dirname+'/puppeteer.png', fullPage: true});
	let page_source = await page.evaluate(() => document.body.innerHTML ).then((pg) => {
		fs.writeFileSync(path.resolve(__dirname, "./source.html"), String(pg), { flag: "w" }, (e) => {
			console.log(`Error : ${e}`);
		})
	});
	*/
	let status = '';
	await page.evaluate(() => document.querySelectorAll("div[class='col-lg-6']")[4].innerHTML ).then((val) => {
		//console.log(`1 : ${val}`);
		status = val;
	});
	await browser.close();
	//console.log(`2 : ${status}`);
	return status;
}


module.exports = scrape;