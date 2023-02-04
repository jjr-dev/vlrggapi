const pup = require('puppeteer');

const url = 'https://www.vlr.gg/rankings/brazil';

(async () => {
    const browser = await pup.launch();
    const page = await browser.newPage();

    await page.goto(url);

    await page.waitForSelector('.rank-item');
    
    const rankings = await page.$$eval('.rank-item', el => el.map((ranking) => {
        let team_href_split = ranking.querySelector('.rank-item-team').href.split('/');

        return {
            position: ranking.querySelector('.rank-item-rank-num').innerText,
            team: {
                id: team_href_split[team_href_split.length - 2],
                slug: team_href_split[team_href_split.length - 1],
                name: ranking.querySelector('.rank-item-team .ge-text').innerText.split('\n')[0].split('#')[0].trim(),
                logo: ranking.querySelector('.rank-item-team img').src,
                link: ranking.querySelector('.rank-item-team').href,
                country: ranking.querySelector('.rank-item-team .ge-text .rank-item-team-country').innerText
            },
            points: ranking.querySelector('.rank-item-rating').innerText
        }
    }));

    console.log(rankings);

    await browser.close();
})();