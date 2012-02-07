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

var isClosed = false;
requester.on('close', function () {
	isClosed = true;
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

process.on('message', function closeHandle (msg) {
	if (msg.what === 'closed') {
		process.removeListener('message', closeHandle);

		if (isClosed) {
			process.send({what: 'closed', online: requester.online, error: null});
		} else {
			requester.on('close', function () {
				process.send({what: 'closed', online: requester.online, error: null});
			});
		}
	}
});
