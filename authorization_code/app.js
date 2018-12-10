/**
 * This is an example of a basic node.js script that performs
 * the Authorization Code oAuth2 flow to authenticate against
 * the Spotify Accounts.
 *
 * For more information, read
 * https://developer.spotify.com/web-api/authorization-guide/#authorization_code_flow
 */

var express = require('express'); // Express web server framework
var request = require('request'); // "Request" library
var cors = require('cors');
var querystring = require('querystring');
var cookieParser = require('cookie-parser');
//var idfile = require('./idfile');

let TM_key = require('./idfile').TM_key;
let client_id = require('./idfile').client_ID; // Your client id
let client_secret = require('./idfile').client_PWRD; // Your secret
var redirect_uri = 'http://localhost:8888/callback'; // Your redirect uri

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

var app = express();

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

        var options = {
          url: 'https://api.spotify.com/v1/me',
          headers: { 'Authorization': 'Bearer ' + access_token },
          json: true
        };

        var topArtists = {
          url: 'https://api.spotify.com/v1/me/top/artists?time_range=medium_term&limit=100',
          headers: { 'Authorization': 'Bearer ' + access_token },
          json: true
        };

        // use the access token to access the Spotify Web API
        request.get(options, function(error, response, body) {
          console.log(body);
        });
        var artistsLength;
        //use access token to access user's top artists
        request.get(topArtists, function(error2, response2, body2){
          //console.log(body2);
          obj = body2['items'];
          artistsLength = obj.length;
          var obj1 = obj[0];
          console.log(obj1['name']);
          // var i;
          // for (i = 0; i < artistsLength; i++){
          //   artistName = obj[i]['name'];
          //   if (artistName == 'Aminé') { artistName = 'amine';}
          //   //console.log(artistName);
          //   artisturl = 'https://app.ticketmaster.com/discovery/v2/events.json?keyword='+artistName+'&city=boston&classificationId=KZFzniwnSyZfZ7v7nJ&apikey=AqksmRI0bTOFqY34PEzOtGHLHgfS8ngE';
          //   //console.log(artisturl);
          //   getConcerts(artisturl);
            
          // }
        });

        // function getConcerts(artisturl){
        //   request(artisturl, { json: true }, (err3, response3, body3) => {
        //     console.log(artisturl);

        //     if ( !err3) {  console.log(body3);}
        //       // console.log('no error')
        //       // var eventsLength = body3['page']['totalElements'];
        //       // if (eventsLength > 0){
        //       //   console.log(body3);
        //       //   var obj2 = body3['_embedded'];
        //       //   var obj3 = obj2['events'];
        //       //   var obj4 = obj3[0];
        //       //   console.log(obj4['name'])
        //       //   //console.log(body3['_embedded']['events'][0]['name']);
        //       //   //console.log(body3);//['page']['totalElements']);
        //       // }
            
        //   });
        // }
        var localConcerts = {
          //url: 'https://app.ticketmaster.com/discovery/v2/events.json?keyword='+artistName+'&city=boston&classificationId=KZFzniwnSyZfZ7v7nJ&apikey='+TM_key,
          url: 'https://app.ticketmaster.com/discovery/v2/events.json?city=new york&classificationId=KZFzniwnSyZfZ7v7nJ&page=1&size=200&apikey='+TM_key,
          json: true
        };

        request.get(localConcerts, function(error3, response3, body3){
          //console.log(body3);
          //body3['page']['number'] = '3';
          //console.log( body3['page']['number']);
          var obj2 = body3['_embedded'];
          //console.log(obj2);
          var obj3 = obj2['events'];
          var obj4 = obj3[5];
          var eventsLength = body3['page']['totalElements'];
          //console.log(obj4['name'])

          var i;
          var j;
          console.log(obj3.length);
          for (i = 0; i < obj3.length; i++){
            var currEvent = obj3[i];
            var currName = currEvent['name'];
            for (j = 0; j < artistsLength; j++){
              var currArtist = obj[j]['name'];
              if(currName.includes(currArtist)){
                console.log(currArtist);
                console.log(currName);
                console.log(currEvent['url']);
              }
            }
          }
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

console.log('Listening on 8888');
app.listen(8888);