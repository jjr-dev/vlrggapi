const puppeteer = require('puppeteer');
const moment = require("moment");

(async () => {
	const browser = await puppeteer.launch();
	const page = await browser.newPage();

	const EVENT_STATUS = {
		upcoming: 'upcoming',
		completed: 'completed'
	};

	let all_matches = [];
	
	function formatMatchResponse(matches) {
		for (const index in matches) {
			const date = matches[index]['date'];
	
			matches[index]['date'] = moment(date).toISOString();
		}
	
		return  {
			matches
		};
	}

	for (const status in EVENT_STATUS) {
		await page.goto('https://www.vlr.gg/team/matches/2406/furia/?group='+EVENT_STATUS[status]);
		
		const matches_by_status = await page.evaluate((status, EVENT_STATUS) => {
			function removeAllChildElements(element) {
				while (element.firstElementChild) {
					element.firstElementChild.remove()
				}
			}

			function removeTabAndBreakLine(string) {
				return string.replaceAll('\t','').replaceAll('\n','');
			}

			function getWinner(scores) {
				const team1 = parseInt(scores[0]);
				const team2 = parseInt(scores[1]);

				if (team1 > team2) {
					return [true, false];
				}
				
				return [false, true];

			}
			
			const matchesData = [];
			const matchesElements = document.querySelectorAll('.m-item');

			for (let i = 0; i < matchesElements.length; i++) {
				const match = matchesElements[i];
				let result = [null, null];
				let winner = [null, null];

				const link = match.href;

				if (status == EVENT_STATUS['completed']) {
					const team_scores = match.querySelectorAll('.m-item-result span');
					
					result = [
						team_scores[0].textContent.trim(),
						team_scores[1].textContent.trim()
					];
					winner = getWinner(result);
				}

				const team_names = match.querySelectorAll('.m-item-team-name');
				const team_tags = match.querySelectorAll('.m-item-team-tag');
				const team_images = match.querySelectorAll('.m-item-logo img');

				const teams = [{
					name: team_names[0].textContent.trim(),
					tag: team_tags[0].textContent.trim(),
					image: team_images[0].src,
					winner: winner[0]
				},
				{
					name: team_names[1].textContent.trim(),
					tag: team_tags[1].textContent.trim(),
					image: team_images[1].src,
					winner: winner[1]
				}];
				
				const event = match.querySelector('.m-item-event div').textContent.trim();

				removeAllChildElements(match.querySelector('.m-item-event'));
				const stage = removeTabAndBreakLine(match.querySelector('.m-item-event').textContent.trim());
				
				const date = match.querySelector('.m-item-date').textContent.trim();
				
				matchesData.push({
					teams,
					result,
					event,
					stage,
					status,
					link,
					date,
				});
			}
			
			return matchesData;
		}, EVENT_STATUS[status], EVENT_STATUS);

		all_matches = all_matches.concat(matches_by_status);
	}
	
	console.log(formatMatchResponse(all_matches));
	
	await browser.close();
})();