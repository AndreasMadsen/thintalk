/**
 * Copyright (c) 2012 Andreas Madsen
 * MIT License
 */

/*jshint strict: true, devel: true, node: true, debug: true,
  white: true, sub: false, newcap: true, curly: true, nomen: true,
  boss: true, eqeqeq: true, noarg: true, onevar: true, undef: true,
  regexp: true, noempty: true, maxerr: 999
 */

(function () {
	"use strict";

	// get the core
	var events = require('events'),
		util = require('util'),
		helpers = require('./helpers.js'),
		message = require('./message.js');

	/**
	 * Internal RPC - used by transport layers
	 */
	function Request(method, args, callback) {
		this.handle.send('internal', [method, args], function (content) {
			callback.apply({}, content);
		});
	}

	function SetupHandle(handler) {
		this.handle = handler.subHandler(this);
	}


	// This is used internally by transport layers
	// and do not support error catching
	message.globalHandlers.internal = function (method, args) {
		var self = this;

		this.communication.handlers[method].apply({
			callback: function () {
				self.callback(true, helpers.toArray(arguments));
			}
		}, args);
	};

	/**
	 * Listener abstract layer
	 */
	function ListenerAbstract(parent, object, layerID) {
		var self = this;

		this.layerID = layerID;
		this.connections = {};
		this.online = false;
		this.object = object;
		this.parent = parent;
		this.handlers = {};

		this.on('listening', function () {
			self.online = true;
		});
		this.on('close', function () {
			self.online = false;
		});
	}
	util.inherits(ListenerAbstract, events.EventEmitter);
	exports.ListenerAbstract = ListenerAbstract;

	/**
	 * Listener abstract layer
	 */
	function CommunicationAbstract(parent, object, layerID, assignID) {
		var self = this;

		this.assignID = assignID;
		this.layerID = layerID;
		this.online = false;
		this.object = object;
		this.parent = parent;
		this.handlers = {};
		this.handle = null;

		this.on('message', function (message) {
			this.handle.handleMessage(message);
		});

		this.on('ready', function () {
			self.online = true;
		});

		this.on('close', function () {
			self.online = false;
		});
	}
	util.inherits(CommunicationAbstract, events.EventEmitter);
	exports.CommunicationAbstract = CommunicationAbstract;

	CommunicationAbstract.prototype.request = Request;
	CommunicationAbstract.prototype.setupHandle = SetupHandle;

	/**
	 * Requester abstract layer
	 */
	function RequesterAbstract(parent, object) {
		var self = this;

		this.assignID = null;
		this.online = false;
		this.parent = parent;
		this.object = object;
		this.handlers = {};
		this.handle = null;

		this.on('message', function (message) {
			this.handle.handleMessage(message);
		});

		this.on('connect', function () {
			self.online = true;
		});

		this.on('close', function () {
			self.online = false;
		});
	}
	util.inherits(RequesterAbstract, events.EventEmitter);
	exports.RequesterAbstract = RequesterAbstract;

	RequesterAbstract.prototype.request = Request;
	RequesterAbstract.prototype.setupHandle = SetupHandle;

})();
