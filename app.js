require('dotenv').config();

const express = require('express');
const cors = require('cors');

const app  = express();

app.use(
    express.urlencoded({
        extended: true
    })
)
app.use(cors());
app.use(express.json());

app.listen(process.env.PORT);

const EventsRouter = require('./src/routes/Event');

app.use('/event', EventsRouter);