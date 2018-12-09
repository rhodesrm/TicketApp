/**
 * This is an example of a basic node.js script that performs
 * the Authorization Code oAuth2 flow to authenticate against
 * the Spotify Accounts.
 *
 * For more information, read
 * https://developer.spotify.com/web-api/authorization-guide/#authorization_code_flow
 */

require('dotenv').config();
var express = require('express'); // Express web server framework
const app = express();
var router = express.Router();
var request = require('request'); // "Request" library
var cors = require('cors');
var querystring = require('querystring');
var cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const mongo = require('mongodb');
const mongoose = require('mongoose');


// const client_id = process.env.client_ID;
// const client_secret = process.env.client_PWRD;
var client_id = '0ef367f85c164b7fbe7c36f68567d404'; // Your client id
var client_secret = '6ccc84bdf4e747469af720e051e34c36'; // Your secret
var redirect_uri = 'http://localhost:8888/callback'; // Your redirect uri


// Database file requirements
const userRoutes = require('./routes/users');

// Connect to mongo database
mongoose.connect(
  "mongodb://rrhodes:" + 
  process.env.MONGO_ATLAS_PW + 
  "@node-ticket-shard-00-00-aoyxz.mongodb.net:27017,node-ticket-shard-00-01-aoyxz.mongodb.net:27017,node-ticket-shard-00-02-aoyxz.mongodb.net:27017/test?ssl=true&replicaSet=node-ticket-shard-0&authSource=admin&retryWrites=true", 
  { useNewUrlParser: true }
);

mongoose.Promise = global.Promise;

// var db;       // = db('localhost:8888/node-ticket');
// //Users = new Mongo.Collection('users');

// app.use(morgan('dev'));
// app.use(bodyParser.urlencoded({extended: false}));
// app.use(bodyParser.json());
// app.use((req, res, next) => {
//   res.header('Access-Control-Allow-Origin', '*');
//   res.header('Access-Control-Allow-Headers', '*');
//   if (req.method === 'OPTIONS') {
//       res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET');
//       return res.status(200).json({});
//   }
//   next();
// });

// // Routes which should handle requests
// app.use('/users', userRoutes);

// // Catch-all error for when going to route that doesn't exist above


/**
 * Generates a random string containing numbers and letters
 * @param  {number} length The length of the string
 * @return {string} The generated string
 */
var generateRandomString = function(length) {
  var text = '';
  var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (var i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};

var stateKey = 'spotify_auth_state';

// var app = express();

app.use(express.static(__dirname + '/public'))
   .use(cors())
   .use(cookieParser());

app.get('/login', function(req, res) {

  var state = generateRandomString(16);
  res.cookie(stateKey, state);

  // your application requests authorization
  var scope = 'user-read-private user-read-email user-top-read';
  res.redirect('https://accounts.spotify.com/authorize?' +
    querystring.stringify({
      response_type: 'code',
      client_id: client_id,
      scope: scope,
      redirect_uri: redirect_uri,
      state: state
    }));
});

app.get('/callback', function(req, res) {

  // your application requests refresh and access tokens
  // after checking the state parameter

  var code = req.query.code || null;
  var state = req.query.state || null;
  var storedState = req.cookies ? req.cookies[stateKey] : null;

  if (state === null || state !== storedState) {
    res.redirect('/#' +
      querystring.stringify({
        error: 'state_mismatch'
      }));
  } else {
    res.clearCookie(stateKey);
    var authOptions = {
      url: 'https://accounts.spotify.com/api/token',
      form: {
        code: code,
        redirect_uri: redirect_uri,
        grant_type: 'authorization_code'
      },
      headers: {
        'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64'))
      },
      json: true
    };

    request.post(authOptions, function(error, response, body) {
      if (!error && response.statusCode === 200) {

        var access_token = body.access_token,
            refresh_token = body.refresh_token;
        
        // store token_id is variable to put in DB document
        var user_doc = {token_id: access_token};

        var options = {
          url: 'https://api.spotify.com/v1/me',
          headers: { 'Authorization': 'Bearer ' + access_token },
          json: true
        };

        var topArtists = {
          url: 'https://api.spotify.com/v1/me/top/artists?time_range=medium_term&limit=25',
          headers: { 'Authorization': 'Bearer ' + access_token },
          json: true
        };

        function topArtistNameFunc(topArtists) {
          topArtistNames = [];
          for (i=0;i<topArtists.length;i++) {
              topArtistNames = topArtistNames + topArtists[i].name;
          }
          console.log(topArtistNames);
      }

      topArtistNameList = topArtistNameFunc(topArtists);
      

        // use the access token to access the Spotify Web API
        request.get(options, function(error, response, body) {
          console.log(body);
        });

        //use access token to access user's top artists
        request.get(topArtists, function(error2, response2, body2){
          console.log(body2);
          obj = body2['items'];
          obj1 = obj[0];
          console.log(obj1['name']);
        });

        userCity = "boston";
        TM_key = process.env.TM_key;

        var localConcerts = {
          url: 'https://app.ticketmaster.com/discovery/v2/events.json?city='+userCity+'&classificationId=KZFzniwnSyZfZ7v7nJ&apikey='+TM_key, //ADD TICKETMASTER API KEY HERE
          json: true
        };

        request.get(localConcerts, function(error3, response3, body3){
          //console.log(body3);
          obj2 = body3['_embedded'];
          //console.log(obj2);
          obj3 = obj2['events'];
          obj3 = obj3[5];
          console.log(obj3['name'])
        });

        // we can also pass the token to the browser to make requests from there
        res.redirect('/#' +
          querystring.stringify({
            access_token: access_token,
            refresh_token: refresh_token
          }));
      } else {
        res.redirect('/#' +
          querystring.stringify({
            error: 'invalid_token'
          }));
      }
    });
  }
});

app.get('/refresh_token', function(req, res) {

  // requesting access token from refresh token
  var refresh_token = req.query.refresh_token;
  var authOptions = {
    url: 'https://accounts.spotify.com/api/token',
    headers: { 'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64')) },
    form: {
      grant_type: 'refresh_token',
      refresh_token: refresh_token
    },
    json: true
  };

  request.post(authOptions, function(error, response, body) {
    if (!error && response.statusCode === 200) {
      var access_token = body.access_token;
      res.send({
        'access_token': access_token
      });
    }
  });
});


var db;
// Users = new Mongo.Collection('users');

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


  // // insert user into DB
  // db.collection("users").insertOne(user_doc, function(err, res) {
  //   if (err) throw err;
  //   console.log("Document inserted");
  // // close connection when done
  //   db.close();
  // })




console.log('Listening on 8888');
app.listen(8888);

module.exports = app;
