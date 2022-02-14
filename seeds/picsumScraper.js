const puppeteer = require('puppeteer');
const fs = require('fs');

async function callLipsumAndSaveReturnedPhoto(numberOfCalls, dims){
    const {width, height} = dims;
    const browser = await puppeteer.launch({
        headless: true
    });
    const page = await browser.newPage();
    const urlToCall = `https://picsum.photos/${width}/${height}`;
    for(i = 0; i < numberOfCalls; i++){
        await page.goto(urlToCall, { waitUntil: 'networkidle0' }).catch(err => console.log(err));
        await page.waitForSelector('img');
        let imgElement = await page.$('img');
        await imgElement.screenshot({path: `C:/Users/davem/Coding/YELL-O/public/images/camp_img_${i}.png`});
    }
    await browser.close();
}
callLipsumAndSaveReturnedPhoto(3, {width: '300', height: '169'});