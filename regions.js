const pup = require('puppeteer');

const url = 'https://www.vlr.gg/events';

(async () => {
    const browser = await pup.launch();
    const page = await browser.newPage();

    await page.goto(url);

    await page.waitForSelector('.mod-full');
    
    const regions = await page.$$eval('.mod-full > .wf-nav > a', el => el.map((region) => {
        let href_split = region.href.split('/');

        return {
            slug: href_split[href_split.length - 1],
            link: region.href,
            title: region.innerText
        }
    }));

    console.log(regions);

    await browser.close();
})();