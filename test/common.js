/**
 * Copyright (c) 2012 Andreas Madsen
 * MIT License
 */
 
var path = require('path');

// root directory of this module
exports.root = path.join(path.dirname(module.filename), '/../');

// path to the file loaded by package.json
exports.modulePath = path.join(exports.root, '/lib/module.js');

// functions to get an abstract or fixture
exports.fixture = makepath('fixture');
exports.abstract = makepath('abstracts');

function makepath(folder) {
	return function (name) {
		return path.join(exports.root, 'test', folder, name + '.js');
	};
}

// common port used
exports.PORT = 3145;
