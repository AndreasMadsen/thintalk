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
	
	requester.on('error', function (err) {
		console.error(err.stack);
	});
	
	listenerProcess.once('message', function (msg) {
		if (layer === 'IPC') {
			requester.connect(layer, listenerProcess);		
		} else if (layer === 'TCP') {
			requester.connect(layer, common.PORT);
		}
	});
	
	return {
		'when connect is emitted': {
			topic: function () {
				var self = this;
				requester.on('connect', function (remote) {
					self.callback(null, requester);
				});
			},
			
			'the online state is true': function (error, result) {
				assert.isTrue(result.online);
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
		},
		
		teardown: function () {
			//this will execute when all contents has been tested
			listenerProcess.kill();
		}
	};
};