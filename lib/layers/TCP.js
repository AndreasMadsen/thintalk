/**
 * Copyright (c) 2012 Andreas Madsen
 * MIT License
 */

(function () {
	"use strict";

	var util = require('util'),
		net = require('net'),
		core = require('../core/core.js');

	/**
	 * Helpers
	 */

	// Since data from a socket comes in buffer streams in an unknown length
	// this helper store the data until a complete json object has been received
	// when a json object is received it will emit the message event on target.
	// JSON strings will be isolated by a newline sign.
	function jsonStream(target, socket) {

		// first set the channel encodeing to utf8
		socket.setEncoding('utf8');

		// data chunks may not contain a complete json string, thats why we store the data
		var jsonBuffer = '';

		// emits when new data from TCP connection is received
		socket.on('data', function (chunk) {
			// first add the chunk to the json buffer
			jsonBuffer += chunk;

			var start = 0, i;
			// next find the next line end char
			while ((i = jsonBuffer.indexOf('\n', start)) >= 0) {

				// if one was found copy it out of the jsonBuffer string
				var json = jsonBuffer.slice(start, i);

				// now that  we have a complete json string
				// emit message with a parsed json object
				target.emit('message', JSON.parse(json));

				// set the starting point of next line end search
				start = i + 1;
			}

			// when no more complete json objects exist in the jsonBuffer,
			// we will slice the jsonBuffer so it only contains the uncomplete json string
			jsonBuffer = jsonBuffer.slice(start);
		});
	}

	/**
	 * Lisenter
	 */

	// this will be called from core, when the lisenter.listen is executed by user
	function Listener() {
		// setup abstract layer
		core.ListenerAbstract.apply(this, arguments);

		// parse the argument
		if (!(this.object instanceof net.Server)) {

			// create a new TCP server
			if (typeof this.object === 'number' || typeof this.object === 'string') {
				this.object = net.createServer().listen(this.object);
			} else {
				this.object = net.createServer().listen(this.object.port, this.object.host);
			}

			this.object.on('listening', this.emit.bind(this, 'listening'));
		} else {
			this.emit('listening');
		}

		// relay errors
		this.object.on('error', this.emit.bind(this, 'error'));

		// relay the close event
		this.object.on('close', this.emit.bind(this, 'close'));

		var self = this;
		// when a remote has connected to this server, this TCP event will emit
		this.object.on('connection', function (socket) {

			// we will emit the connection event to create a new communication object
			// the socket argument set here will be this.object in the new communication object
			self.emit('connection', socket);
		});
	}
	util.inherits(Listener, core.ListenerAbstract);
	exports.Listener = Listener;

	// this will be called from core, when lisenter.close is excuted by user
	Listener.prototype.close = function () {
		//  TCP function there will refuse any new connections
		this.object.close();

		// next we end all connections
		// all online communications objects are stored in this.connections
		// in this case a TCP socket is stored in .object so we can just close on that one
		for (var assignID in this.connections) {
			this.connections[assignID].object.end();
		}
	};

	// this will be called from core when layer-lisenter object when it emit connection
	function Communication() {
		// setup abstract layer
		core.CommunicationAbstract.apply(this, arguments);

		// when socket is closed we will emit the close event
		this.object.on('close', this.emit.bind(this, 'close'));

		// setup a json stream handler there rescive data from the TCP socket
		// remember that this.object is the TCP socket
		jsonStream(this, this.object);
	}
	util.inherits(Communication, core.CommunicationAbstract);
	exports.Communication = Communication;

	// this will be called from core, when a message need to be sended
	// 1: when the core setup the requester object
	// 2: in response to a request from the requester
	Communication.prototype.send = function (message) {

		// send the json message using JSON.stringify and add a linebreak to indicate json-end
		// also encode as utf8
		this.object.write(JSON.stringify(message) + '\n', 'utf8');
	};

	/**
	 * Requester
	 */

	// this will be called from core when requester.connect is executed by user
	function Requester() {
		// setup abstract layer
		core.RequesterAbstract.apply(this, arguments);

		// parse the argument
		if (typeof this.object === 'number' || typeof this.object === 'string') {
			this.object = net.createConnection(this.object);
		} else if (!(this.object instanceof net.Server)) {
			this.object = net.createConnection(this.object.port, this.object.host);
		}

		// relay errors
		this.object.on('error', this.emit.bind(this, 'error'));

		// when socket is closed we will emit the close event
		this.object.on('close', this.emit.bind(this, 'close'));

		// setup a json stream handler there rescive data from the TCP socket
		jsonStream(this, this.object);
	}
	util.inherits(Requester, core.RequesterAbstract);
	exports.Requester = Requester;

	// this will be called from core, when a message need to be sended
	// 1: when a method in the remote object is called
	Requester.prototype.send = function (message) {

		// send the json message using JSON.stringify and add a linebreak to indicate json-end
		// also encode as utf8
		this.object.write(JSON.stringify(message) + '\n', 'utf8');
	};

	// this will be called from core, when requester.close is excuted by user
	Requester.prototype.close = function () {

		// we will close the socket gracefull by calling this.object.end
		// when the socket is closed it will emit 'close'.
		this.object.end();
	};

})();