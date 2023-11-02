const pup = require("puppeteer");
const moment = require("moment");

// const url = "https://www.vlr.gg/283109/gonext-esports-vs-tbd-valorant-east-united-season-2-stage-3-finals-playoffs-ubsf";
const url = "https://www.vlr.gg/277849/tbd-thailand-predator-league-2024-qf-gf";

(async () => {
    const browser = await pup.launch();
    const page = await browser.newPage();

    await page.goto(url);

    await page.waitForSelector(".match-header");

    const event = await page.$eval(".match-header-event", (container) => {
        const href_split = container.href.split("/");

        return {
            id: href_split[href_split.length - 3],
            slug: href_split[href_split.length - 2],
            logo: container.querySelector("img").src,
            series: container.querySelector("div.match-header-event-series").innerText,
            title: container.querySelector("div > div:first-child").innerText,
            link: container.href,
        };
    });

    const patch = await page.$eval(".match-header-date div:last-child div", (el) => el.innerText).catch(() => null);
    const date = await page.$eval(".match-header-date div:first-child", (el) => el.dataset.utcTs);

    const picksAndBans = await page
        .$eval(".match-header-note", (el) => {
            const items = el.innerText.split(";");

            items.map((item, index) => {
                items[index] = item.trim();
            });

            return items;
        })
        .catch(() => null);

    const vods = await page.$$eval(".match-vods .match-streams-container a", (el) =>
        el.map((vod) => {
            return {
                title: vod.innerText,
                link: vod.href,
            };
        })
    );

    const teams = await page.$eval(".match-header-vs", (container) => {
        const teams = [];

        for (let i = 1; i <= 2; i++) {
            const teamContainer = container.querySelector(`.match-header-link.mod-${i}`);
            const scoreContainer = container.querySelector(".match-header-vs-score");

            teams.push({
                link: teamContainer.href,
                title: teamContainer.querySelector(".wf-title-med").innerText,
                ranking: teamContainer.querySelector("div:last-child").innerText.replace(/\D/g, ""),
                logo: teamContainer.querySelector("img").src,
                score: scoreContainer.querySelector(`.match-header-vs-score span:${i == 1 ? "first-child" : "last-child"}`).innerText.trim(),
            });
        }

        return teams;
    });

    const match = {
        event,
        patch,
        date: moment(date).toISOString(),
        picksAndBans,
        vods,
        teams,
    };

    console.log(match);

    await browser.close();
})();
