/**
 * Copyright (c) 2012 Andreas Madsen
 * MIT License
 */

(function () {
	"use strict";

	var helpers = require('./helpers.js');

	exports.globalHandlers = {};

	function MessageHandler(root, handlers) {
		this.handlers = helpers.mergeObjects(handlers, exports.globalHandlers);
		this.root = root;
		this.callbacks = {};
		this.callbackID = 0;
	}
	exports.MessageHandler = MessageHandler;

	MessageHandler.prototype.subHandler = function(communication) {
		return new SubHandler(this, communication);
	};

	function SubHandler(master, communication) {
		this.root = master.root;
		this.master = master;
		this.communication = communication;
	}
	SubHandler.prototype.handleMessage = function(message) {
		var self = this;

		if (message.query) {
			this.master.callbacks[message.query].apply(null, message.args);

		} else if(message.echo) {
			this.master.handlers[message.method].apply({
				ipc: this,
				communication: this.communication,
				root: this.root,
				callback: function () {
					self.communication.send({
						query: message.echo,
						args: helpers.toArray(arguments)
					});
				}
			}, message.args);
		}
	};

	SubHandler.prototype.send = function (method, args, callback) {
		var nextID = this.master.callbackID += 1;

		this.communication.send({
			method: method,
			args: args,
			echo: nextID
		});

		this.master.callbacks[nextID] = callback;
	};

})();
