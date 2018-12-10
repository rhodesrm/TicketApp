var express = require('express');
var router = express.Router();
var request = require("request");
var apikey = require("./keys");

router.get('/', function(req, res, next) {
	// Comment out this line:
  //res.send('respond with a resource');

  // And insert something like this instead:
  var options = { method: 'GET',
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

	//res.send(body)  
});

module.exports = router;