/*
* Author: Wayne Ho
* Mail: hewr2010@gmail.com
* Time: Tue 14 Oct 2014 02:39:09 PM CST
* Purpose: Simple Server for Streaming Video (from StackOverflow)
*/

var http = require('http');
var fs = require('fs');
var util = require('util');
var url = require("url");

var host = "127.0.0.1", port = "8888";
//var url = "http://" + host + ":" + port + "/";

http.createServer(function(req, res) {
	var video_id = url.parse(req.url).pathname;
	var path = "videos" + video_id + ".mp4";
	var stat = fs.statSync(path);
	if (req.headers['range']) {
		var ranges = req.headers.range.replace(/bytes=/, "").split("-");
		var start = parseInt(ranges[0], 10);
		var end = ranges[1] ? parseInt(ranges[1], 10) : stat.size - 1;
		var chunksize = (end - start) + 1;
		console.log('RANGE: ' + start + ' - ' + end + ' = ' + chunksize);
		var file = fs.createReadStream(path, {start: start, end: end});
		res.writeHead(206, {'Content-Range': 'bytes ' + start + '-' + end + '/' + stat.size,
							'Content-Length': chunksize,
							'Accept-Ranges': 'bytes',
							'Content-Type': 'video/mp4' });
		file.pipe(res);
	} else {
		console.log('ALL: ' + stat.size);
		res.writeHead(200, {'Content-Length': stat.size,
							'Content-Type': 'video/mp4' });
		fs.createReadStream(path).pipe(res);
	}
}).listen(port, host);
console.log("server running at " + url);
