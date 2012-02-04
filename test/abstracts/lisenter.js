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

	return [{
		// first batch of tests
		'when ready event is emitted': {
			topic: function () {
				var self = this;
				lisenter.on('listening', function () {
					self.callback(null, lisenter);
				});
			},

			'the online state is true': function (error, result) {
				assert.isTrue(result.online);
			}
		},

		'when connection has been made': {
			topic: function () {
				var self = this;
				lisenter.on('connection', function () {
					self.callback(null, lisenter);
				});
			},

			'connection event will emit': function (error, result) {
				assert.isNull(error);
			}
		}

	}, {
		'when we request a method there exist': {
			topic: function () {
				var self = this;
				requesterProcess.send({
					what: 'request',
					method: 'add',
					args : [2, 3]
				});

				lisenter.on('request', function (/* name, args, result */) {
					self.callback(this.error, arguments);
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
				assert.equal(result[2], 6);
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

				lisenter.on('request', function (/* name, args, result */) {
					self.callback(this.error, arguments);
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
				assert.isUndefined(result[2]);
				assert.length(result, 3);
			}
		}
	}, {
		// second batch of test
		// we will close in this batch so no more should follow

		'when closeing the lisenter': {
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
			},

			'the online state will become false': function (error, result) {
				assert.ifError(error);
				assert.isFalse(result.online);
			},

			'the requester will': {
				topic: function () {
					var self = this;

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