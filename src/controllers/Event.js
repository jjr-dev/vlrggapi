const EventsService = require('../services/Event')

class Events {
    async List(req, res) {
        let { region } = req.params;

        const events = await EventsService.List({region});

        res.status(201).json(events);
    }
}

module.exports = new Events()