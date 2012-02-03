/**
 * Copyright (c) 2012 Andreas Madsen
 * MIT License
 */

var common = require('../common'),
	vows = require('vows');

var test = vows.describe('Testing IPC lisenter abstract layer');
common.setupAbstractBatch(test, 'lisenter', 'IPC');
test.exportTo(module);
