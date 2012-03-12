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
	 * Listener
	 */
	function Listener(args) {
		this.table = args[0];
		this.assignID = 0;
		this.layerID = 0;
		this.online = false;
		this.layers = {};
		this.connections = {};
	}
	util.inherits(Listener, events.EventEmitter);
	exports.Listener = Listener;

	// begin listen to an transport layer
	Listener.prototype.listen = function (layerName, object) {
		var self = this;

		// get layer collection
		var layerCollection = exports.layers[layerName];

    // check that layer is supported
    if (layerCollection === undefined) {
      this.emit('error', new Error('The layer ' + layerName + ' do not exist.'));
      return;
    }

		// create a new messageHandler
		var handler = new message.MessageHandler(this, handlers);

		// Create and store layer object
		this.layerID += 1;
		var layer = new layerCollection.Listener(object, this.layerID);
		this.layers[layer.layerID] = layer;

		// Relay errors form layer to top
		layer.on('error', this.emit.bind(this, 'error'));

		// emit listening when all layers are listening
		layer.on('listening', function () {

			// do not check if we are online
			if (self.online === true) return;

			// check all layers
			var missing = false, layerID;
			for (layerID in self.layers) {
				if (self.layers[layerID].online === false) {
					missing = true;
				}
			}

			if (missing === false) {
				self.online = true;
				self.emit('listening');
			}
		});

		// Handle layer close
		layer.on('close', function () {

			// relay close to all assosiated communication objects
			for (var assignID in layer.connections) {
				layer.connections[assignID].emit('close');
			}

			// remove the layer
			delete self.layers[layer.layerID];

			// emit close if all layers are ofline (layer map is empty)
			if (Object.keys(self.layers).length === 0) {
				self.online = false;
				self.emit('close');
			}
		});

		// Handle new connections by createing a communcation object
		layer.on('connection', function (object) {

			// Create new connection and assing with ID
			self.assignID += 1;
			var communcation = new layerCollection.Communication(object, layer.layerID, self.assignID);
			self.connections[communcation.assignID] = communcation;
			layer.connections[communcation.assignID] = communcation;

			// Relay error messages from communcation to layer
			communcation.on('error', layer.emit.bind(layer, 'error'));

			// Handle client disconnect: set online and remove
			communcation.on('close', function () {
				if (self.connections[communcation.assignID]) {
					delete layer.connections[communcation.assignID];
					delete self.connections[communcation.assignID];
				}
			});

			// setup message handler
			communcation.setupHandle(handler);

			// run setup handler
			communcation.handle.send('setup', [communcation.assignID, Object.keys(self.table)], function () {
				communcation.emit('ready');
			});

			// emit connection
			self.emit('connection', communcation);
		});
	};

	// when calling close relay it to all layers
	Listener.prototype.close = function () {
		for (var layerID in this.layers) {
			var layer = this.layers[layerID];
			layer.close();
		}
	};

	// This will be called when a public method is requiested
	handlers.call = function (method, args) {
		var self = this;

		// check that communcation is online
		if (this.communication.online === false) { // FIX ME: ipc has no online property
			this.root.emit('error', new Error("could not handle a request from a online communication"));
			return;
		}

		var func = this.root.table[method];

		// run the function in a try catch
		try {
			// in case no errors was throwed
			func.apply({
				callback: function () {
					self.root.emit('request', null, method, args, helpers.toArray(arguments));
					self.callback(true, helpers.toArray(arguments));
				}
			}, args);

		} catch (err) {

			// in case of an error
			// we will convert it to an Error object and return it
			var  error = err;
			if (!(err instanceof Error)) {
				error = new Error(err);
			}
			this.root.emit('request', error, method, args, null);
			this.callback(false, helpers.error2object(error));
		}
	};

})();
