/**
 * Copyright (c) 2012 Andreas Madsen
 * MIT License
 */

(function () {
	"use strict";

	// get the core
	var events = require('events'),
		util = require('util'),
		helpers = require('./helpers.js'),
		message = require('./message.js'),
		handlers = {};
		
	/**
	 * Requester
	 */
	function Requester(args) {
		var self = this;
		
		this.lisenter = args[0];
		this.remote = null;
		helpers.softDefine(this, 'online', {
			get: function () {
				if (self.layer && self.layer.online) {
					return true;
				}
				return false;
			}
		});
	}
	util.inherits(Requester, events.EventEmitter);
	exports.Requester = Requester;
	
	// connect to remote
	Requester.prototype.connect = function (layerName, object) {
		var self = this;
		
		// Create and store layer object
		var layerCollection = exports.layers[layerName];
		this.layer = new layerCollection.Requester(this, object);	
		
		// add lisenter to connect stack
		if (this.lisenter) {
			this.layer.on('connect', this.lisenter);
		}
		
		// Relay error and close events
		this.layer.on('close', this.emit.bind(this, 'close'));
		this.layer.on('error', this.emit.bind(this, 'error'));
		this.layer.on('connect', this.emit.bind(this, 'connect'));
		
		// execute ready event handlers if they are set after online is true
		this.on('newListener', function (name, fn) {
			if (name === 'connect' && self.online === true) {
				fn(self.remote);
			}
		});
		
		// setup message handler
		var handler = new message.MessageHandler(this, handlers);
		this.layer.setupHandle(handler);
	};
	
	// close the communication
	Requester.prototype.close = function () {
		if (this.online === false) {
			this.emit('error', new Error("Requester is already closed"));
			return;
		}
		
		this.layer.close();
	};
	
	// assing requester with an id and send all stored requests
	handlers.setup = function (id, methods) {
		var layer = this.communication;
		
		// set the ID and online
		layer.assignID = id;

		// setup all request functions
		layer.remote = new RemoteWrapper(this.self, methods);
		
		// this will set online in remote
		this.callback();
		
		// emit connect
		this.communication.emit('connect', this.communication.remote);
	};
	
	/**
	 * RemoteWrapper
	 */
	function RemoteWrapper(parent, methods) {
		
		function requestWrapper(name) {
			return function () {
				request(parent, name, arguments);
			};
		}
		
		var i = methods.length;
		while (i--) {
			this[methods[i]] = requestWrapper(methods[i]);
		}
	}

	// request a method from the listener
	function request(parent, name, args) {
		
		var layer = parent.communication;
		
		// check online
		if (!layer.online) {
			parent.emit('error', new Error("Could not make a request, channel is ofline"));
		}
		
		// convert args to a real array
		args = helpers.toArray(args);
	
		// store callback for later
		var callback = args.pop();
		
		parent.send('call', [name, args], function (sucess, content) {
			if (sucess) {
				callback.apply({
					error: null
				}, content);
			} else {
				callback.apply({
					error: helpers.object2error(content)
				}, []);
			}
		});
	}
	
})();
