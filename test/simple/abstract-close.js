/**
 * Copyright (c) 2012 Andreas Madsen
 * MIT License
 */

var common = require('../common'),
	thintalk = require(common.modulePath),
    assert = require('assert'),
    path = require('path'),
    child_process = require('child_process');

module.exports = function (layer) {
	var listenerProcess = child_process.fork(path.join(common.fixtureDir, '/lisenter-simple.js'), [layer]),
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
		
		teardown: function () {
			//this will execute when all contents has been tested
			listenerProcess.kill();
		}
	};
};