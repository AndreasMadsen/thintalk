/**
 * Copyright (c) 2012 Andreas Madsen
 * MIT License
 */

var common = require('../common'),
	vows = require('vows'),
	test = require(common.abstract('receiver'));

vows.describe('Testing TCP abstract layer')
	.addBatch(test('TCP'))
	.exportTo(module);
