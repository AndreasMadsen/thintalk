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
			remote[msg.method].apply(remote, (msg.args).concat([function () {}]) );
		} else if (msg.what === 'fail') {
			throw new Error("critical error");
		}

	});
});

process.on('message', function connectHandle (msg) {
	if (msg.what === 'connect') {
		process.removeListener('message', connectHandle);

		if (process.argv[2] === 'IPC') {
			requester.connect('IPC', process);
		} else if (process.argv[2] === 'TCP') {
			requester.connect('TCP', common.PORT);
		}
	}
});