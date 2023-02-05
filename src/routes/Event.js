const router = require('express').Router()

const EventsController = require('../controllers/Event')

router.get('/:region?', EventsController.List)

module.exports = router;