/**
 * Copyright (c) 2012 Andreas Madsen
 * MIT License
 */

var common = require('../common'),
	vows = require('vows');

var test = vows.describe('Testing IPC abstract layer');
common.setupAbstractBatch(test, 'receiver', 'IPC');
test.exportTo(module);
