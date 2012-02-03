/**
 * Copyright (c) 2012 Andreas Madsen
 * MIT License
 */

var common = require('../common'),
	thintalk = require(common.modulePath);

var requester = thintalk();

requester.on('connect', function (remote) {
	process.on('message', function (msg) {

		if (msg.what === 'request') {
			remote[msg.method].apply(remote, msg.args);
		} else if (msg.what === 'fail') {
			throw new Error("critical error");
		}

	});
});

if (process.argv[2] === 'IPC') {
	requester.connect('IPC', process);
} else if (process.argv[2] === 'TCP') {
	requester.connect('TCP', common.PORT);
}
