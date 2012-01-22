/**
 * Copyright (c) 2012 Andreas Madsen
 * MIT License
 */

(function () {
	"use strict";

	/**
	 * Helpers
	 */
	// Used to convert arguments to an real array
	exports.toArray = function (args) {
		var out = [];
		for (var i = 0, l = args.length; i < l; i++) {
			out.push(args[i]);
		}
		return out;
	};

	// Used to convert errors to plain object so they can be converted to JSON
	exports.error2object = function (error) {
		var out = {};
		for (var name in error) {
			out[name] = error[name];
		}
		out.message = error.message;
		out.stack = error.stack;
		out.type = error.type;
		out.construct = error.constructor.name;

		return out;
	};
	
	// Used to convert object to errors, use as a reverce function to error2object
	exports.object2error = function (object) {
		var out = new global[object.construct](object.message);

		delete object.construct;
		for (var name in object) {
			out[name] = object[name];
		}

		return out;
	};
	
	// merge two objects intro a new one 
	exports.mergeObjects = function (one, two) {
		var out = {}, name;
		for (name in one) {
			out[name] = one[name];
		}
		for (name in two) {
			out[name] = two[name];
		}
		return out;
	};
	
	exports.softDefine = function (object, name, settings) {
		Object.defineProperty(object, name, exports.mergeObjects(settings, {
			enumerable: true,
			configurable: true	
		}));
	};
	
})();