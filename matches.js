const pup = require('puppeteer');
const moment = require("moment");

const url = 'https://www.vlr.gg/event/matches/1188/champions-tour-2023-lock-in-s-o-paulo/?series_id=all&group=all';

function formatMatchResponse(matches, event_name) {
    for (const index in matches) {
        const date = matches[index]['date'];

        matches[index]['date'] = moment(date).toISOString();
    }

    return  {
        event: event_name,
        matches
    };
}

(async () => {
    const browser = await pup.launch();
    const page = await browser.newPage();
    
    await page.goto(url);
    await page.waitForSelector('.mod-1');
    
    const event_name = await page.$eval('.wf-title', el => el.innerText);
    const matches = await page.$$eval('.wf-label.mod-large', el => el.map((match_date) => {
        function removeAllChildElements(element) {
            while (element.firstElementChild) {
                element.firstElementChild.remove()
            }
        }

        function getIdInURL(url) {
            return url.split('/').filter(linkPart => /^\d+$/.test(linkPart))[0];
        }

        let matches_of_day = [];

        const matches_date = match_date.innerText.trim();
        const match_elements = match_date.nextElementSibling.children;
        
        for (let match of match_elements) {
            removeAllChildElements(match.querySelector('.match-item-event'));
            
            const link = match.href;
            const id = getIdInURL(link);
            const teams = [{
                name: match.querySelectorAll('.match-item-vs .text-of')[0].innerText.trim(),
                winner: match.querySelectorAll('.match-item-vs-team')[0].classList.contains('mod-winner')
            },{
                name: match.querySelectorAll('.match-item-vs .text-of')[1].innerText.trim(),
                winner: match.querySelectorAll('.match-item-vs-team')[1].classList.contains('mod-winner')
            }
            ];
            const result = [
                match.querySelectorAll('.match-item-vs-team-score')[0].innerText.trim(),
                match.querySelectorAll('.match-item-vs-team-score')[1].innerText.trim()
            ];
            const stage = match.querySelector('.match-item-event').innerText.trim();
            const status = match.querySelector('.ml-status').innerText.trim();
            const time = match.querySelector('.match-item-time').innerText.trim();
            const date = `${matches_date} ${time}`;

            matches_of_day.push({
                id,
                link,
                date,
                teams,
                result,
                stage,
                status
            });
        }

        return matches_of_day
    }).flat(1));

    console.log(formatMatchResponse(matches, event_name));

    await browser.close();
})();