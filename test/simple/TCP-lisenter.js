/**
 * Copyright (c) 2012 Andreas Madsen
 * MIT License
 */

var common = require('../common'),
	vows = require('vows');

var test = vows.describe('Testing TCP lisenter abstract layer');
common.setupAbstractBatch(test, 'lisenter', 'TCP');
test.exportTo(module);
