/**
 * Copyright (c) 2012 Andreas Madsen
 * MIT License
 */

var common = require('../common'),
	vows = require('vows'),
	abstractTest = require('./abstract-simple.js');

vows.describe('Testing IPC abstract layer')
	.addBatch(abstractTest('IPC'))
	.exportTo(module);