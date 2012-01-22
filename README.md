#thintalk

###Please NOTE:

> This module is not yet stable, but will be it very soon.
> Until version 0.2.0 use it on own risk.

**Thintalk is a thin RPC layer over different transport layers.**

> RPC is an acronyms for _Remote procedure call_, meaning that the protocol is
> a simple function request with function arguments, and the response will be
> arguments parsed to an callback.
> The result is you can call code on the _server_ without transferee the entire
> function source code.
> 
> The benefits of `thintalk` compared to `nowJS` or `dnode` is that this is very
> thin resulting in minimal overhead. However the cost is that this module is not
> meant to be used in combination with none-node clients like browsers.

## Features
 - Simple RPC layer with minimal overhead.
 - Same API independent of the transport layer.

## Installation

```sheel
npm install `thintalk`
```

## API documentation

###The listener

```javascript
var thintalk = require('thintalk');

var listener = thintalk({
  add: function (a, b) {
    this.callback(a + b);
  }
});

lisenter.on('error', function (err) {
	throw err;
});

// Yes you can listen on multiply transport layers
lisenter.listen('TCP', 4000);
lisenter.listen('IPC', require('child_process').fork('./child.js'));
```

###The TCP requester

```javascript
var thintalk = require('thintalk');

var requester = thintalk(function (remote) {
	
	remote.add(2, 4, function (result) {
	  console.log(result); // 6
	});
	
}).connect('TCP', 4000);

requester.on('error', function (err) {
	throw err;
});
```

###The IPC requester

```javascript
var thintalk = require('thintalk');

var requester = thintalk(function (remote) {
	
	remote.add(2, 4, function (result) {
	  console.log(result); // 6
	});
	
}).connect('TCP', 4000);

requester.on('error', function (err) {
	throw err;
});
```

##License

**The software is license under "MIT"**

> Copyright (c) 2012 Andreas Madsen
>
> Permission is hereby granted, free of charge, to any person obtaining a copy
> of this software and associated documentation files (the "Software"), to deal
> in the Software without restriction, including without limitation the rights
> to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
> copies of the Software, and to permit persons to whom the Software is
> furnished to do so, subject to the following conditions:
>
> The above copyright notice and this permission notice shall be included in
> all copies or substantial portions of the Software.
>
> THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
> IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
> FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
> AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
> LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
> OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
> THE SOFTWARE.
