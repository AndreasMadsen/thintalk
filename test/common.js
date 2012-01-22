/**
 * Copyright (c) 2012 Andreas Madsen
 * MIT License
 */
 
//Directorys
var path = require('path');
exports.testDir = path.dirname(module.filename);
exports.root = path.join(exports.testDir, '/../');
exports.apiAbstract = path.join(exports.testDir, 'apiAbstract.js');
exports.fixtureDir = path.join(exports.testDir, '/fixture/');
exports.modulePath = path.join(exports.root, '/lib/module.js');

exports.PORT = 3145;