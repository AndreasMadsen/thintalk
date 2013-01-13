#thintalk

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
 - Extendable abstraction layer.

## Installation

```sheel
npm install thintalk
```

## Example

```javascript
var listener = thintalk({
  add: function (a, b) {
    this.callback(a + b);
  }
});

lisenter.on('listening', function () {

  var requester = thintalk(function (remote) {
    remote.add(2, 4, function (result) {
      console.log(result); // 6
    });
  });
  requester.connect('IPC', 4001);
  
});

lisenter.listen('TCP', 4001);
```

## API documentation

The modules is required by using the following code:

```JavaScript
var thintalk = require('thintalk');
```

The variable `thintalk` now contain a function, depending on how it is called
a `Listener` or a `Requester` object is returned.

###The listener

A `Lisenter` is return if the `thintalk` function was called with a `object`.
The given object should contain all `procedures` there can be called by the `requester`.
Note that you are not allowed to add or remove procedures later.

```JavaScript
var listener = thintalk({
  add: function (a, b) {
    this.callback(a + b);
  }
});
```

#### Lisenter.listen

The `lisenter` object must listen on something. this is done by calling the `.listen`
method. The first argument in the `.listen` method specify the layer the other arguments
are send to the layer handler.

Note that you can call listen as many times as you want.

```JavaScript
lisenter.listen('TCP', 4001);
lisenter.listen('TCP', 4002);

var child = require('child_process').fork('./child.js');
lisenter.listen('IPC', child);
```

#### Lisenter.close

To close the `lisenter` simply call `.close`, note that all layers will be closed.

#### Events

Any errors there might occurre should be emitted though the `error` event, if not
then it is properly a bug.

```JavaScript
lisenter.on('error', function (err) {
  throw err;
});
```

The `listening` is emitted when a new lisenter layer is assigned and it is ready to rescive
requests.

```JavaScript
lisenter.on('listening', function () {
  console.log('layer ready');
});
```

When a `requester` is connected to the `lisenter` object a `connection` event is emitted:

```JavaScript
lisenter.on('connection', function () {
  console.log('requester connected');
});
```

When closeing the `lisenter` a `close` event is emitted when all layers are closed.

```JavaScript
lisenter.on('close', function () {
  console.log('lisenter closed');
});
```

When a `requester` make a `procedure request` a `request` event is emitted when a result
is found or an errors accoured.

```JavaScript
lisenter.on('request', function (error, name, args, result) {
  console.log('The function ' + name + ' was called with the arguments ' + args.join(', '));

  if (error !== null) {
    console.log('But the function called failed:');
    console.error(error.stack);
  } else {
    console.log('the result was ' + result);
  }
});
```

###The Requester

The `thintalk` function will return a `Requester` object when a `function` or no arguments is given.

As with the `Lisenter` there is no API diffrence between the diffrence layers you might use.
However a `Requester` can only connect to one remote.

If a function was given it is called with a `remote` object as its only arguments. The remote object
contain the `procedures` defined in the `lisenter`, however they are only `wrappers` there call the remote
`procedure`. The last argument in the `wrapper` are a callback containing a `result` argument.

```JavaScript
var requester = thintalk(function (remote) {
  remote.add(2, 4, function (result) {
    console.log(result); // 6
  });
});
```

You connect to the remote by using the `.connect` method. The API is the same with `.listen` the
first argument specify the layer and the other arguments are send to the layer handler.

To connect to a port using the the TCP layer:

```JavaScript
requester.connect('TCP', 4000);
```

To connect to a process using the IPC layer.

```JavaScript
requester.connect('IPC', process);
```

#### Requester.close

To close the `requester` simply call `.close`.

```JavaScript
requester.close();
```

#### Events

Any errors there might occurre should be emitted though the `error` event, if not
then it is properly a bug.

```JavaScript
requester.on('error', function (err) {
  throw err;
});
```

When calling `.close` from the `requester` or the attached `lisenter` a `close` event
is emitted when the `requester` is closed.

```JavaScript
requester.on('close', function () {
  console.log('requester closed');
});
```

After calling `.connect` a `connect` event is emitted when every this is setup. The event
handler is called with the `remote` object there also was given in `function` when calling
the `thintalk` method.


```JavaScript
requester.on('connect', function (remote) {
  remote.add(2, 4, function (result) {
    console.log(result); // 6
  });
});
```

## Writeing a layer interface

There are two buildin layers `IPC` and `TCP`, they work very diffrent but use the same
API abstaction to create an RPC interface. You can find the layers in `/lib/layers`, they
are highly documented and should be easy to follow.

The general pattern is that there are three exported constructor functions, there inherts
from a abstraction object. You will find that there is a little diffrence between the buildin
layer and user layers. The buildin layers require an internal `core.js` module however you should
just require the `thinktalk` module. This module will exports `ListenerAbstract`, `CommunicationAbstract`
and `RequesterAbstract` just as the `core.js` module.

You will also need to use the `setLayer` function, this takes 2 arguments the first is the
`layer name` the second is export from the required user layer.

```JavaScript
var layer = require('layer');
var thintalk = require('thintalk');
thintalk.setLayer('layer', layer);
```

You can the use `lisenter.listen('layer', options ...)` and `requester.connect('layer', options ...)`
just as with the `TCP` and `IPC` layer.

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
