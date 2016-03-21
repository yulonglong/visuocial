var express = require('express');
var app = require('express')();
var http = require('http').Server(app);
var port = process.env.PORT || 4242;

app.use(express.static(__dirname + '/public_html'));

app.get('/', function(req, res){
	res.sendFile(__dirname + '/public_html/index.html');
});


http.listen(port, function(){
	console.log('listening on *:'+port);
});

var db = require('./db.js');
console.log ("Test DB config import");
console.log (db.config);

// var Connection = require('tedious').Connection;
// var connection = new Connection(db.config);
// connection.on('connect', function(err) {
//     console.log(err);
//     // If no error, then good to proceed.
//     console.log("Connected");
// });
