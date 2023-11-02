const pup = require('puppeteer');
const moment = require("moment");

const url = 'https://www.vlr.gg/matches';

function formatMatchResponse(matches) {
    for (const index in matches) {
        const date = matches[index]['date'];

        matches[index]['date'] = moment(date).toISOString();
    }

    return  {
        matches
    };
}

(async () => {
    const browser = await pup.launch();
    const page = await browser.newPage();
    
    await page.goto(url);
    
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

        removeAllChildElements(match_date);
        const matches_date = match_date.innerText.trim();
        const match_elements = match_date.nextElementSibling.children;
        
        for (let match of match_elements) {

            const stage = match.querySelector('.match-item-event-series').innerText.trim().split('–');
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
                match.querySelectorAll('.match-item-vs-team-score')[0].innerText.trim().replace("–", "0"),
                match.querySelectorAll('.match-item-vs-team-score')[1].innerText.trim().replace("–", "0")
            ];
            
            const event = match.querySelector('.match-item-event').innerText.trim();
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
                status,
                event
            });
        }

        return matches_of_day
    }).flat(1));

    console.log(formatMatchResponse(matches));

    await browser.close();
})();