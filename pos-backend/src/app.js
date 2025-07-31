const express = require('express');
const cors = require('cors');
const connectDb = require('./config/db');

const app = express();

connectDb();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send('API is running......');
});

module.exports = app;
