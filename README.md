# prometheus

[![Node.js CI](https://github.com/CowboyJoe997/prometheus/actions/workflows/node.js.yml/badge.svg)](https://github.com/CowboyJoe997/prometheus/actions/workflows/node.js.yml)

Prometheus helps to analyze javascript promises.

Prometheus is a helper tool that shows your promises.
In normal development it is difficult to debug promises since you dont have a good grip on them. You do not know where they are or when they get executed or in which state they are in.
I tried to address this and you can register your promises to keep track on them.
Then you can take a look at your promises and in which state they are.
This helps to understand where a promise is hanging or why a promise does not work as intended.
There are synced(!) and asynced versions available.

Note: The hacks to achieve the synced version are dark as the night, but since there is no good low level api there is no other way atm.

# Installation

```console
npm install https://github.com/CowboyJoe997/prometheus
```

# Usage


To get an overview try
```console
npm run test
```
and see test.js for more info.

To include it in your code add:

```javascript
const { prometheus } = require('prometheus');
```

To use this tool you have to transform your code in the following way:

Your original code might look like this:

```javascript
new Promise((resolve, reject) => {
	setTimeout(() => {
		console.log('TICK!');
		resolve(5)
	}, 3000);
})
```

First we need a handle (in this case p1) for the promise:

```javascript
const p1 = new Promise((resolve, reject) => {
	setTimeout(() => {
		console.log('TICK!');
		resolve(5)
	}, 3000);
})
```

Next we need to register the promise. You can give it a name (e.g. 'Bob') to identify it.

```javascript
const p1 = new Promise((resolve, reject) => {
	setTimeout(() => {
		console.log('TICK!');
		resolve(5)
	}, 3000);
})

// register it
prometheus.register(p1, 'Bob');
```

Finally you have to wrap the resolve/reject call. This is necessary if you want to autoremove the promises once they are resolved.
If you have a few promises only, you can skip this and keep all promises even when resolved.

```javascript
const p1 = new Promise((resolve, reject) => {
	setTimeout(() => {
		console.log('TICK!');
		prometheus.process(p1, () => { // add this line before the resolve
			resolve(5)
		})(); // add this line after the resolve
	}, 3000);
})

// register it
prometheus.register(p1, 'Bob');
```

## autoremove
TODO

## Show Promises

To show the promises use

```javascript
showRegisteredPromisesSync();
```
This gives the following output:
```console
1 Promise(s) registered:
    ID: Bob State: resolved
```
Note that this shows the registered promises only.

## Cyclic

A cyclic task can be used to show all promises repeatedly.

To start it use:
```javascript
prometheus.startCyclic(500);

```

To stop it use:
```javascript
prometheus.stopCyclic();
```

# License

MIT
