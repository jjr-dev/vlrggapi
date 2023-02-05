require('dotenv').config();

const express = require('express');
const cors = require('cors');

const app  = express();
const port = process.env.PORT || 3000;

app.use(
    express.urlencoded({
        extended: true
    })
)
app.use(cors());
app.use(express.json());

app.listen(port, (err) => console.log(err ? `Error: ${err}` : `Started on port ${port}`));

const EventsRouter = require('./src/routes/Event');

app.use('/event', EventsRouter);