/**
 * Copyright (c) 2012 Andreas Madsen
 * MIT License
 */

var common = require('../common'),
	thintalk = require(common.modulePath),
    assert = require('assert'),
    child_process = require('child_process');

module.exports = function (layer) {
	var lisenter = thintalk({
		add: function (a, b) {
			this.callback(a + b);
		},

		fail: function () {
			throw "error";
		}
	});

	var requesterProcess = child_process.fork(common.fixture('requester'), [layer]);

	if (layer === 'IPC') {
		lisenter.listen(layer, requesterProcess);
	} else if (layer === 'TCP') {
		lisenter.listen(layer, common.PORT);
	}

	lisenter.on('listening', function () {
		requesterProcess.send({what: 'connect'});
	});

	// check listening event now
	var isListening = false;
	lisenter.once('listening', function () {
		isListening = true;
	});

	// check connection event now
	var isConnection = false;
	lisenter.once('connection', function () {
		isConnection = true;
	});

	return [{
		// first batch of tests
		'when listening event is emitted': {
			topic: function () {
				var self = this;
				if (isListening) {
					self.callback(null, lisenter);
				} else {
					lisenter.once('listening', function () {
						self.callback(null, lisenter);
					});
				}
			},

			'the online state is true': function (error, result) {
				assert.isTrue(result.online);
			}
		},

		'when connection has been made': {
			topic: function () {
				var self = this;
				if (isConnection) {
					self.callback(null, lisenter);
				} else {
					lisenter.once('connection', function () {
						self.callback(null, lisenter);
					});
				}
			},

			'connection event will emit': function (error, result) {
				assert.isNull(error);
			}
		}

	}, {
		// Second batch
		// we can assume the connection has been made

		'when we request a method there exist': {
			topic: function () {
				var self = this;
				requesterProcess.send({
					what: 'request',
					method: 'add',
					args : [2, 3]
				});

				lisenter.on('request', function removeMe(error, name, args, result) {
					if (name !== 'add') return;

					self.callback(error, [name, args, result]);
					lisenter.removeListener('request', removeMe);
				});
			},

			'callback is called with no error': function (error, result) {
				assert.isNull(error);
			},

			'callback is called with name and args set': function (error, result) {
				assert.equal(result[0], 'add');
				assert.deepEqual(result[1], [2, 3]);
			},

			'callback is called with a result': function (error, result) {
				assert.equal(result[2], 5);
			}
		},

		'when we requiest a method there throw': {
			topic: function () {
				var self = this;
				requesterProcess.send({
					what: 'request',
					method: 'fail',
					args : [2, 3]
				});

				lisenter.on('request', function removeMe(error, name, args, result) {
					if (name !== 'fail') return;

					self.callback(error, [name, args, result]);
					lisenter.removeListener('request', removeMe);
				});
			},

			'callback is called with an error property': function (error, result) {
				assert.instanceOf(error, Error);
			},

			'callback is called with name and args set': function (error, result) {
				assert.equal(result[0], 'fail');
				assert.deepEqual(result[1], [2, 3]);
			},

			'callback is called without a result': function (error, result) {
				assert.isNull(result[2]);
				assert.lengthOf(result, 3);
			}
		}
	}, {
		// Third batch of test
		// we will close in this batch so no more should follow

		'when we close the lisenter': {
			topic: function () {
				var self = this;

				function close() {
					lisenter.removeListener('error', error);
					self.callback(null, lisenter);
				}

				function error(err) {
					lisenter.removeListener('close', close);
					self.callback(err, null);
				}

				lisenter.once('error', error);
				lisenter.once('close', close);
				lisenter.close();
			},

			'the close event will emit': function (error, result) {
				assert.ifError(error);
				assert.ifError(result);
			},

			'the online state will become false': function (error, result) {
				assert.ifError(error);
				console.log(result);
				assert.isFalse(result.online);
			},

			'the requester will': {
				topic: function () {
					var self = this;

					console.log('new topic');

					requesterProcess.send({
						what: 'closed'
					});
					requesterProcess.on('message', function(msg) {
						if (msg.what === 'closed') {
							self.callback(msg.error, msg.online);
						}
					});
				},

				'emit close': function (error, result) {
					assert.ifError(error);
					assert.ifError(result);
				},

				'become ofline': function (error, result) {
					assert.equal(result, false);
				}
			}
		},

		teardown: function () {
			// this will execute when all contents has been tested
			requesterProcess.kill();
		}
	}];
};