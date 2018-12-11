var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var request = require('request');
var querystring = require('querystring');
var apikey = require("./keys");

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

var mysql = require('mysql');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
//app.use('/ticketmaster', ticketmasterRouter);
//app.use('/login', spotifyLoginRouter);
//app.use('/callback', spotifyCallbackRouter);
//app.use('/spotifyuser', spotifyUserRouter);
// app.use('/tmcall', tmcallRouter);



//Testing

global.access_token = '';

let redirect_uri = 
  process.env.REDIRECT_URI || 
  'http://localhost:3001/callback'

app.get('/ticketmaster', function(req, res, next) {
  let options = { method: 'GET',
	  url: 'https://app.ticketmaster.com/discovery/v2/events.json',
	  qs: {  classificationName: 'music', stateCode: 'MA', apikey: apikey.TICKETMASTER_ID },
	  headers:
	      { 'Postman-Token': 'b9d317df-22cb-4b5d-8fad-73f23965de1e',
	        'cache-control': 'no-cache' } 
	   };

	request(options, function (error, response, body) {
	  if (error) throw new Error(error);
	  res.send(body);
	});
});

app.get('/login', function(req, res, next) {
  res.redirect('https://accounts.spotify.com/authorize?' +
    querystring.stringify({
      response_type: 'code',
      client_id: apikey.SPOTIFY_CLIENT_ID,
      scope: 'user-read-private user-read-email user-top-read',
      redirect_uri
    }))
});

app.get('/callback', function(req, res) {
  let code = req.query['code'] || null
  let authOptions = {
    url: 'https://accounts.spotify.com/api/token',
    form: {
      code: code,
      redirect_uri,
      grant_type: 'authorization_code'
    },
    headers: {
      'Authorization': 'Basic ' + (new Buffer(
        apikey.SPOTIFY_CLIENT_ID + ':' + apikey.SPOTIFY_CLIENT_SECRET
      ).toString('base64'))
    },
    json: true
  }
  request.post(authOptions, function(error, response, body) {
    access_token = body.access_token
    var refresh_token = body.refresh_token;
    let userOptions = {
     url: 'https://api.spotify.com/v1/me',
     headers: { 'Authorization': 'Bearer ' + access_token },
     json: true
    }

    let uri = process.env.FRONTEND_URI || 'http://localhost:3000'
    res.redirect(uri)
  })
}); 

app.get('/spotifyuser', function(req, res, next) {
  let code = req.query['code'] || null
  let authOptions = {
    url: 'https://accounts.spotify.com/api/token',
    form: {
      code: code,
      redirect_uri,
      grant_type: 'authorization_code'
    },
    headers: {
      'Authorization': 'Basic ' + (new Buffer(
        apikey.SPOTIFY_CLIENT_ID + ':' + apikey.SPOTIFY_CLIENT_SECRET
      ).toString('base64'))
    },
    json: true
  };

  request.post(authOptions, function(error, response, body) {

  	 let userOptions = {
     url: 'https://api.spotify.com/v1/me',
     headers: { 'Authorization': 'Bearer ' + access_token },
     json: true
  	}

    request.get(userOptions, function(userError, userResponse, userBody){
    	// console.log('Display Name: ' + userBody.display_name);
    	// console.log('Id: '+ userBody.id);
    	var x = userBody.display_name;
    	var y = userBody.id;
    	var con = mysql.createConnection({
    		host: "localhost",
    		user: "root",
    		password: "",
    		database: "user_accounts"
    	});

    	con.connect(function(err){
    		if (err) throw err;

    		var sql = "INSERT INTO user_accounts (Username, User_ID) VALUES ('"+x+"','"+y+"')";
    		con.query(sql, function (err, result){
    			if (err) throw err;
    		});
    	});
    	res.send(userBody);
    })
  })
}); 

// app.get('/topartists', function(req, res, next) {
//   let code = req.query['code']
//   let authOptions = {
//     url: 'https://accounts.spotify.com/api/token',
//     form: {
//       code: code,
//       redirect_uri,
//       grant_type: 'authorization_code'
//     },
//     headers: {
//       'Authorization': 'Basic ' + (new Buffer(
//         apikey.SPOTIFY_CLIENT_ID + ':' + apikey.SPOTIFY_CLIENT_SECRET
//       ).toString('base64'))
//     },
//     json: true
//   };

//   request.post(authOptions, function(error, response, body) {

//     let topArtists = {
//       url: 'https://api.spotify.com/v1/me/top/artists',
//       headers: { 'Authorization': 'Bearer ' + access_token },
//       json: true
//     };

//     let artistsLength;
//     //use access token to access user's top artists
//     request.get(topArtists, function(error2, response2, body2){
// 		obj = body2['items'];
// 		artistsLength = obj.length;
// 		let obj1 = obj[0];
// 		artistsName = obj1['name']
// 		let artistList = [];
// 		let x;
// 		for (x = 0; x < artistsLength; x++){
// 			artistList.push(obj[x]['name']);
// 		}
// 		res.send(artistList);
// 		});
// 	});
// });

app.get('/tm', function(req, res, next) {
  let code = req.query['code']
  let authOptions = {
    url: 'https://accounts.spotify.com/api/token',
    form: {
      code: code,
      redirect_uri,
      grant_type: 'authorization_code'
    },
    headers: {
      'Authorization': 'Basic ' + (new Buffer(
        apikey.SPOTIFY_CLIENT_ID + ':' + apikey.SPOTIFY_CLIENT_SECRET
      ).toString('base64'))
    },
    json: true
  };

  request.post(authOptions, function(error, response, body) {
    let topArtists = {
      url: 'https://api.spotify.com/v1/me/top/artists?time_range=medium_term&limit=100',
      headers: { 'Authorization': 'Bearer ' + access_token },
      json: true
    };

    let localConcerts = {
    	url: 'https://app.ticketmaster.com/discovery/v2/events.json?city=boston&classificationId=KZFzniwnSyZfZ7v7nJ&page=0&size=200&apikey='+apikey.TICKETMASTER_ID,
    	json: true
    };

    let artistsLength;
    //use access token to access user's top artists
    request.get(topArtists, function(error2, response2, body2){
		obj = body2['items'];
		artistsLength = obj.length;
		let obj1 = obj[0];
		artistsName = obj1['name']
		let artistList = [];
		let x;
		for (x = 0; x < artistsLength; x++){
			artistList.push(obj[x]['name']);
		}
		});

    request.get(localConcerts, function(error3, response3, body3){
    	var obj2 = body3['_embedded'];
		var obj3 = obj2['events'];
		var obj4 = obj3[5];
		var minPrice = obj4['priceRanges']['min'];
		var eventsLength = body3['page']['totalElements'];
		var i;
		var j;
		var results = [];
		for (i = 0; i < obj3.length; i++){
			var currEvent = obj3[i];
			var currName = currEvent['name'];
			for (j = 0; j < artistsLength; j++){
			  var currArtist = obj[j]['name'];
			  if(currName.includes(currArtist)){
			    results.push(obj3[i]);
			    // console.log(obj3[i]);
			    // console.log('HIT!');
			    // console.log(currArtist);
			    // console.log(currName);
			    // console.log(currEvent['url']);
			  }
			}
		}
		var events = results
		var _embedded = {events}
		var output = {_embedded}
		res.send(output);
    });
  })
}); 



//Testing

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});


module.exports = app;
