/**
 * Copyright (c) 2012 Andreas Madsen
 * MIT License
 */

var common = require('../common'),
	thintalk = require(common.modulePath),
    assert = require('assert'),
    child_process = require('child_process');

module.exports = function (layer) {
	var listenerProcess = child_process.fork(common.fixture('lisenter'), [layer]),
		requester = thintalk();

	listenerProcess.once('message', function (msg) {
		if (layer === 'IPC') {
			requester.connect(layer, listenerProcess);
		} else if (layer === 'TCP') {
			requester.connect(layer, common.PORT);
		}
	});

	return [{
		// first batch of tests
		'when connect is emitted': {
			topic: function () {
				var self = this;
				requester.on('connect', function (remote) {
					self.callback(null, requester);
				});
			},

			'the online state is true': function (error, result) {
				assert.isTrue(result.online);
			},

			'when listning on connect again': {
				topic: function () {
					var self = this;
					requester.on('connect', function (remote) {
						self.callback(null, remote);
					});
				},

				'it too will emit properly': function (error, remote) {
					assert.isDefined(remote, 'add');
					assert.isDefined(remote, 'fail');
				}
			}
		},

		'when we request a method there exist': {
			topic: function () {
				var self = this;
				requester.on('connect', function (remote) {
					remote.add(2, 4, function () {
						self.callback(this.error, arguments);
					});
				});
			},

			'callback is called with correct argument': function (error, result) {
				assert.ifError(error);
				assert.equal(result[0], 6);
			},

			'callback is called with error equal null': function (error, result) {
				assert.isNull(error);
			}
		},

		'when we requiest a method there throw': {
			topic: function () {
				var self = this;

				//temporally ignore error
				var none = function () {};
				requester.once('error', none);

				requester.on('connect', function (remote) {
					remote.fail(2, 4, function () {
						requester.removeListener('error', none);
						self.callback(this.error, arguments);
					});
				});
			},

			'callback is called without arguments': function (error, result) {
				assert.isEmpty(result);
			},

			'callback is called with this.error': function (error, result) {
				assert.instanceOf(error, Error);
				assert.equal(error.message, "error");
			}
		}
	}, {
		// second batch of test
		// we will close in this batch so no more should follow

		'when closeing the connection': {
			topic: function () {
				var self = this;

				function close() {
					requester.removeListener('error', error);
					self.callback(null, requester);
				}

				function error(err) {
					requester.removeListener('close', close);
					self.callback(err, null);
				}

				requester.once('error', error);
				requester.once('close', close);
				requester.close();
			},

			'the close event will emit': function (error, result) {
				assert.ifError(error);
			},

			'the online state will become false': function (error, result) {
				assert.ifError(error);
				assert.isFalse(result.online);
			},

			'and atempting to make a request': {
				topic: function () {
					var self = this;

					function error(err) {
						self.callback(err, null);
					}
					requester.on('error', error);

					requester.remote.add(2, 2, function (result) {
						requester.removeListener('error', error);
						self.callback(this.error, result);
					});
				},

				'it will fail': function (err, result) {
					assert.instanceOf(err, Error);
					assert.equal(err.message, 'Could not make a request, channel is offline');
				}
			}
		},

		teardown: function () {
			// this will execute when all contents has been tested
			listenerProcess.kill();
		}
	}];
};