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
	
	function mergeObject(from, to) {
		for (var name in from) {
			to[name] = from[name];
		}
	}
	
	var lisenter = require('./lisenter.js'),
		requester = require('./requester.js'),
		abstract = require('./abstract.js');
	
	mergeObject(lisenter, exports);
	mergeObject(requester, exports);
	mergeObject(abstract, exports);
	
	requester.layers = lisenter.layers = exports.layers = {};
})();