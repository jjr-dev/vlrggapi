const pup = require('puppeteer');

const url = 'https://www.vlr.gg/team/6961';

(async () => {
    const browser = await pup.launch();
    const page = await browser.newPage();

    await page.goto(url);

    await page.waitForSelector('.team-header');
    
    const items  = await page.$$eval('.team-summary-container-1 > *', el => el.map((item) => item.innerHTML));

    let rosters_card_position;

    items.forEach(async (item, index) => {
        if(item.includes('Current') && item.includes('Roster'))
            rosters_card_position = index + 2;
    })

    let rosters = null;
    if(rosters_card_position) {
        rosters = await page.evaluate((rosters_card_position) => {
            const el = document.querySelector(`.team-summary-container-1 .wf-card:nth-child(${rosters_card_position})`);

            let list = {};

            let players_element = el.querySelector('.wf-module-label:nth-child(1) + div');
            if(players_element)
                list.players = players_element.querySelectorAll('.team-roster-item');

            let staff_element = el.querySelector('.wf-module-label:nth-child(3) + div');
            if(staff_element)
                list.staff = staff_element.querySelectorAll('.team-roster-item');

            let rosters = {
                players: [],
                staff: []
            };

            for(let prop in list) {
                let item = list[prop];

                item.forEach((player) => {
                    let role        = player.querySelector('.team-roster-item-name-role');
                    let href_split  = player.querySelector('a').href.split('/');
    
                    rosters[prop].push({
                        nickname: player.querySelector('.team-roster-item-name-alias').innerText.trim(),
                        name: player.querySelector('.team-roster-item-name-real').innerText.trim(),
                        image: player.querySelector('.team-roster-item-img img').src,
                        region: player.querySelector('.team-roster-item-name-alias .flag').classList[1].split('-')[1],
                        role: role ? role.innerText : null,
                        link: player.querySelector('a').href,
                        slug: href_split[href_split.length - 1],
                        id: href_split[href_split.length - 2]
                    });
                })
            }
            
            if(rosters.players.length == 0 && rosters.staff.length == 0)
                return null;

            return rosters;
        }, rosters_card_position)
    }

    const ranking = await page.evaluate(() => {
        const el = document.querySelector('.team-rating-info .rating-num')

        if(!el || el.innerText.trim() === 'Unranked')
            return null;

        const region = document.querySelector('.team-rating-info .rating-txt');

        return {
            position: el.innerText.trim(),
            region: region ? region.innerText : null
        }
    })

    const tag = await page.evaluate(() => {
        const el = document.querySelector('.team-header-name h2')

        if(!el)
            return null;

        return el.innerText
    })

    let links = [];
    (await page.$$eval('.team-header-links a', el => el.map((link) => {
        return {
            link: link.href,
            text: link.innerText,
        }
    }))).forEach((link) => {
        if(link.text !== '')
            links.push(link);
    })
    links = links.length > 0 ? links : null;

    const team = {
        logo: await page.$eval('.wf-avatar img', el => el.src),
        name: await page.$eval('.team-header-name h1', el => el.innerText),
        country: await page.$eval('.team-header-country', el => el.innerText.trim()),
        links,
        rosters,
        tag,
        ranking
    };

    console.log(team);

    await browser.close();
})();