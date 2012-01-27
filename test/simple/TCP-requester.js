/**
 * Copyright (c) 2012 Andreas Madsen
 * MIT License
 */

var common = require('../common'),
	vows = require('vows');

var test = vows.describe('Testing TCP requester abstract layer');
common.setupAbstractBatch(test, 'requester', 'TCP');
test.exportTo(module);
