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

// setup vows batches
exports.setupAbstractBatch = function (vows, name, layer) {
	var abstract = require(exports.abstract(name));

	abstract(layer).forEach(function (batch) {
		vows.addBatch(batch);
	});
};

// common port used
exports.PORT = 3145;
