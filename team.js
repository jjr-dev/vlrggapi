const pup = require('puppeteer');

const url = 'https://www.vlr.gg/team/6961';

(async () => {
    const browser = await pup.launch();
    const page = await browser.newPage();

    await page.goto(url);

    await page.waitForSelector('.team-header');
    
    const team = {
        logo: await page.$eval('.wf-avatar img', el => el.src),
        name: await page.$eval('.team-header-name h1', el => el.innerText),
        tag: await page.$eval('.team-header-name h2', el => el.innerText),
        country: await page.$eval('.team-header-country', el => el.innerText.trim()),
        links: await page.$$eval('.team-header-links a', el => el.map((link) => {
            return {
                link: link.href,
                text: link.innerText,
            }
        }))
    };

    console.log(team);

    await browser.close();
})();