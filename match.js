const pup = require('puppeteer');

const url = 'https://www.vlr.gg/130685';

(async () => {
    const browser = await pup.launch();
    const page = await browser.newPage();

    await page.goto(url);

    await page.waitForSelector('.match-header');

    const points = await page.evaluate(() => {
        const els = document.querySelectorAll('.match-header-vs-score span')
        
        let ps = [];

        els.forEach((e) => {
            if(Number.isInteger(parseInt(e.innerText))) {
                let split = e.classList[0].split('-');

                ps.push({
                    points: e.innerText,
                    winner: split[split.length - 1] == 'winner' ? true : false
                })
            }
        })

        return ps;
    })

    const teams = await page.$$eval('.match-header-vs .match-header-link', el => el.map((team, index) => {
        let href_split = team.href.split('/');

        return {
            name: team.querySelector('.match-header-link-name .wf-title-med').innerText,
            logo: team.querySelector('img').src,
            slug: href_split[href_split.length - 1],
            id: href_split[href_split.length - 2],
            link: team.href
        }
    }))

    teams.forEach((team, index) => {
        teams[index] = Object.assign(team, points[index]);
    })

    const event = await page.$eval('.match-header-event', el => {
        let href_split = el.href.split('/');
        
        return {
            logo: el.querySelector('img').src,
            stage: el.querySelector('.match-header-event-series').innerText,
            name: el.querySelector('img ~ div div:not(.match-header-event-series)').innerText,
            link: el.href,
            slug: href_split[href_split.length - 2],
            id: href_split[href_split.length - 3]
        }
    })

    

    const maps = await page.$$eval('.vm-stats-gamesnav-item:not(.mod-all)', el => el.map((map) => {
        let name_split = map.innerText.split(' ');

        const order = name_split[0];
        name_split.shift();

        return {
            id: map.getAttribute('data-game-id'),
            played: map.getAttribute('data-disabled') == 0 ? true : false,
            name: name_split.join(' '),
            order,
        }
    }))

    // TODO: Obter vods

    const match = {
        date: await page.$eval('.match-header-date .moment-tz-convert:nth-child(1)', el => el.innerText),
        hour: await page.$eval('.match-header-date .moment-tz-convert:nth-child(2)', el => el.innerText),
        type: await page.$eval('.match-header-vs-score .match-header-vs-note:last-child', el => el.innerText),
        stage: await page.$eval('.match-header-vs-score .match-header-vs-note:first-child', el => el.innerText),
        teams,
        event,
        maps,
    }

    console.log(match);

    await browser.close();
})();