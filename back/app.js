const express = require('express');
const app = express();
const morgan = require('morgan');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const venueRoutes = require('./api/routes/venues');
const userRoutes = require('./api/routes/users');


mongoose.connect(
    "mongodb://rrhodes:" + 
    process.env.MONGO_ATLAS_PW + 
    "@node-ticket-shard-00-00-aoyxz.mongodb.net:27017,node-ticket-shard-00-01-aoyxz.mongodb.net:27017,node-ticket-shard-00-02-aoyxz.mongodb.net:27017/test?ssl=true&replicaSet=node-ticket-shard-0&authSource=admin&retryWrites=true",
    { useNewUrlParser: true }
);

mongoose.Promise = global.Promise;

app.use(morgan('dev'));
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', '*');
    if (req.method === 'OPTIONS') {
        res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET');
        return res.status(200).json({});
    }
    next();
});

// Routes which should handle requests
app.use('/venues', venueRoutes);
app.use('/users', userRoutes);

// Catch-all error for when going to route that doesn't exist above
app.use((req, res, next) => {
    const error = new Error('Not found');
    error.status = 404;
    next(error);
})

app.use((error, req, res, next) => {
    res.status(error.status || 500);
    res.json({
        error: {
            message: error.message
        }
    });
});

module.exports = app;
