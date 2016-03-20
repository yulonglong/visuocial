var express = require('express');
var app = require('express')();
var http = require('http').Server(app);
var port = process.env.PORT || 4242;

// Local path
if (port == 4242) {
	javaExec = "java";
}

app.use(express.static(__dirname + '/public_html'));

app.get('/', function(req, res){
	res.sendFile(__dirname + '/public_html/index.html');
});


http.listen(port, function(){
	console.log('listening on *:'+port);
});

