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
	var core = require('./core/core.js');
	
	module.exports = function (arg) {
		var object;
		
		if (typeof arg === 'object' && arg !== null) {
			object = new core.Listener(arguments);
		} else {
			object = new core.Requester(arguments);	
		}
		
		return object;
	};

	// export core so et it can be easy used in layers
	module.exports.core = core;
	
	// export a setLayer method
	function setLayer(layerName, object) {
		core.layers[layerName] = object;
	}
	module.exports.setLayer = setLayer;
	
	// predefine TCP and IPC layers
	setLayer('TCP', require('./layers/TCP.js'));
	setLayer('IPC', require('./layers/IPC.js'));
	
})();