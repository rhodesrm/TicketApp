var express = require('express');
var router = express.Router();
var querystring = require('querystring');
var app = express();
var request = require("request");
var apikey = require("./keys");

let redirect_uri = 
  process.env.REDIRECT_URI || 
  'http://localhost:3001/callback'

router.get('/', function(req, res, next) {
  res.redirect('https://accounts.spotify.com/authorize?' +
    querystring.stringify({
      response_type: 'code',
      client_id: apikey.SPOTIFY_CLIENT_ID,
      scope: 'user-read-private user-read-email',
      redirect_uri
    }))
});


module.exports = router;