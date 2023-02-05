const { deepStrictEqual } = require('assert');
const e = require('express');
const fs  = require('fs');
const pup = require('puppeteer');

const url = 'https://www.vlr.gg/events';

class Events {
    async List(data) {
        let events;

        let file = `./src/cache/events.json`;
        if(fs.existsSync(file)) {
            events = fs.readFileSync(file, 'utf8');
            return JSON.parse(events);
        }

        events = await this.ListByOrigin(data);
        fs.writeFileSync(file, JSON.stringify(events));

        return events;
    }

    async ListByOrigin(data) {
        const browser = await pup.launch();
        const page = await browser.newPage();

        await page.goto(`${url}/${data.region ? data.region : ''}`);

        await page.waitForSelector('.events-container');

        const events_u_c = await page.$$eval('.events-container .events-container-col', el => el.map((item) => {
            let list = [];

            item.querySelectorAll('a.event-item').forEach((event) => {
                let href_split = event.href.split('/')

                list.push({
                    id: href_split[href_split.length - 2],
                    slug: href_split[href_split.length - 1],
                    link: event.href,
                    title: event.querySelector('.event-item-inner .event-item-title').innerText,
                    thumb: event.querySelector('.event-item-thumb img').src,
                    status: event.querySelector('.event-item-desc-item-status').innerText,
                    prize: event.querySelector('.event-item-desc-item.mod-prize').innerText.split('\n')[0],
                    dates: event.querySelector('.event-item-desc-item.mod-dates').innerText.split('\n')[0],
                    region: event.querySelector('.event-item-desc-item.mod-location .flag').classList[1].split('-')[1]
                })
            })

            return list;
        }))

        const events = {
            upcoming:  events_u_c[0],
            completed: events_u_c[1]
        }

        await browser.close();
        
        return events;
    }
}

module.exports = new Events