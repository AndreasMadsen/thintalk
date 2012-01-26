/**
 * Copyright (c) 2012 Andreas Madsen
 * MIT License
 */

var common = require('../common'),
	vows = require('vows'),
	test = require(common.abstract('receiver'));

vows.describe('Testing IPC abstract layer')
	.addBatch(test('IPC'))
	.exportTo(module);
