/**
 * Copyright (c) 2012 Andreas Madsen
 * MIT License
 */

(function () {
	"use strict";

	var util = require('util'),
		core = require('../core/core.js');

	/**
	 * Lisenter
	 */

	// this will be called from core, when the lisenter.listen is executed by user
	function Listener() {
		// setup abstract layer
		core.ListenerAbstract.apply(this, arguments);

		var self = this;

		// in case the process die, the connection will be severed
		this.object.on('exit', function () {
			if (self.online === true) {
				this.emit('close');
			}
		});

		process.nextTick(function () {
			// setup a new connection with the object
			self.emit('listening');

			// setup a new connection with the object
			self.emit('connection', self.object);
		});
	}
	util.inherits(Listener, core.ListenerAbstract);
	exports.Listener = Listener;

	// this will be called from core, when lisenter.close is excuted by user
	Listener.prototype.close = function () {
		// since we can't relly close anything we will ask remote to not send messages
		// to ask the remote without polution the users remote object you can use the
		// request function. This is not as sophisticated as the one users have,
		// so you have to make sure that a close function exist, and that works.

		// get the first and only connection
		var self = this;
		var connect = this.connections[ Object.keys(this.connections)[0] ];
		connect.request('close', [], function () {
			connect.emit('close');
			self.emit('close');
		});
	};

	// this will be called from core when layer-lisenter object when it emit connection
	function Communication() {
		// setup abstract layer
		core.CommunicationAbstract.apply(this, arguments);

		// just relay message object they do not need to be parsed
		this.object.on('message', this.emit.bind(this, 'message'));

		// when the remote request a method, the methods should exists in .handlers
		var self = this;
		this.handlers.close = function () {
			this.callback();
			self.emit('close');
		};
	}
	util.inherits(Communication, core.CommunicationAbstract);
	exports.Communication = Communication;

	// this will be called from core, when a message need to be sended
	// 1: when the core setup the requester object
	// 2: in response to a request from the requester
	Communication.prototype.send = function (message) {

		// just send message JSON will be handled by node.js core
		this.object.send(message);
	};

	/**
	 * Requester
	 */

	// this will be called from core when requester.connect is executed by user
	function Requester() {
		// setup abstract layer
		core.RequesterAbstract.apply(this, arguments);

		// in case the process die, the connection will be severed
		this.object.on('exit', function () {
			if (self.online === true) {
				this.emit('close');
			}
		});

		// just relay message object they do not need to be parsed
		this.object.on('message', this.emit.bind(this, 'message'));

		// when the remote request a method, the methods should exists in .handlers
		var self = this;
		this.handlers.close = function () {
			this.callback();
			self.emit('close');
		};
	}
	util.inherits(Requester, core.RequesterAbstract);
	exports.Requester = Requester;

	// this will be called from core, when a message need to be sended
	// 1: when a method in the remote object is called
	Requester.prototype.send = function (message) {
		// we will not send messages if the channel is closed
		if (this.online === false) return;

		// just send message JSON will be handled by node.js core
		this.object.send(message);
	};

	// this will be called from core, when requester.close is excuted by user
	Requester.prototype.close = function () {

		// since we can't relly close anything we will ask remote to not send messages
		this.request('close', [], this.emit.bind(this, 'close'));
	};
})();