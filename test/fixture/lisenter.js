/**
 * Copyright (c) 2012 Andreas Madsen
 * MIT License
 */

var common = require('../common'),
	thintalk = require(common.modulePath);
	
var listener = thintalk({
	add: function (a, b) {
		this.callback(a + b);
	},
	
	fail: function () {
		throw "error";
	}
});

if (process.argv[2] === 'IPC') {
	listener.listen('IPC', process);
} else if (process.argv[2] === 'TCP') {
	listener.listen('TCP', common.PORT);	
}

listener.on('listening', function () {
	process.send('ready');
});
