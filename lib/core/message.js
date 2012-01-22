/**
 * Copyright (c) 2012 Andreas Madsen
 * MIT License
 */

(function () {
	"use strict";
	
	var helpers = require('./helpers.js');
	
	exports.globalHandlers = {};
	
	function MessageHandler(parent, handlers) {
		this.handlers = helpers.mergeObjects(handlers, exports.globalHandlers);
		this.root = parent;
		this.parent = parent;
		this.callbacks = {};
		this.callbackID = 0;
	}
	exports.MessageHandler = MessageHandler;

	MessageHandler.prototype.subHandler = function(communication) {
		return new SubHandler(this, communication);
	};
	
	function SubHandler(parent, communication) {
		this.root = parent.root;
		this.parent = parent;
		this.communication = communication;
	}
	SubHandler.prototype.handleMessage = function(message) {
		var self = this;
		
		if (message.query) {
			this.parent.callbacks[message.query].apply(null, message.args);
		
		} else if(message.echo) {
			this.parent.handlers[message.method].apply({
				self: self,
				communication: self.communication,
				root: self.root,
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
		var nextID = this.parent.callbackID += 1;
		
		this.communication.send({
			method: method,
			args: args,
			echo: nextID
		});
		
		this.parent.callbacks[nextID] = callback;
	};
	
})();