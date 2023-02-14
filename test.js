"use strict"

// TODO: lib

const { prometheus } = require('./prometheus');

function testSync() {

	const a = Promise.resolve('result');
	const b = Promise.reject('cause');
	const c = new Promise(() => {});

	console.log('sync a: ' + prometheus.getPromiseStateSync(a));

	// NOTE: This is working, but the rejected promise throws an exception:
	// console.log('sync b: ' + prometheus.getPromiseStateSync(b));

	// To capture the exception you could have the idea to add a .catch().
	// this is NOT working. catch goes async and the result is pending.
	// For the WHOLE expression it IS correct but it does not show the
	// rejected promise.
	// console.log('sync b: ' + prometheus.getPromiseStateSync(b.catch((error) => {})));

	// Instead we register an event handler to not crash the app.
	process.on('unhandledRejection', function(err, promise) {
		// console.log('Unhandled rejection (promise: ', promise, ', reason: ', err, ').');
	});

	// now this is working:
	console.log('sync b: ' + prometheus.getPromiseStateSync(b));

	console.log('sync c: ' + prometheus.getPromiseStateSync(c))
}

function testAsync() {

	const a = Promise.resolve();
	const b = Promise.reject();
	const c = new Promise(() => {});

	prometheus.getPromiseStateAsync(a).then(state => console.log('async a: ' + state)); // fulfilled
	prometheus.getPromiseStateAsync(b).then(state => console.log('async b: ' + state)); // rejected
	prometheus.getPromiseStateAsync(c).then(state => console.log('async c: ' + state)); // pending
}

function testSyncWithCyclicUpdate() {

	// external lib
	// TODO:

	const a = Promise.resolve();
	const b = Promise.reject();
	const c = new Promise(() => {});

	const intervalId = setInterval(() => {
		const [itemsPromiseStatus, items] = getPromiseDetails(a); // lib

		console.log(itemsPromiseStatus);

		if (itemsPromiseStatus === PromiseStatus.REJECTED) {
			clearInterval(intervalId);
		}

		if (itemsPromiseStatus === PromiseStatus.FULFILLED) {
			clearInterval(intervalId);
			console.log(items);
		}
	}, 200);

}

function main() {

	prometheus.DebugLevel = 0;

	console.log('Async is started first');
	testAsync();

	console.log('Sync is started second');
	testSync();

	console.log('But Sync is _executed_ before async! This shows that sync is REALLY sync.');
	console.log('-----------------------------');

	// start cyclic
	prometheus.startCyclic(500);

	// create a promise which resolves after 3s
	const p1 = new Promise((resolve, reject) => {
		setTimeout(() => {
			console.log('TICK!');
			prometheus.process(p1, () => { // add this line before the resolve
				resolve(5)
			})(); // add this line after the resolve
		}, 2000);
	})

	// register it
	prometheus.register(p1, 'Bob');

	// stop cyclic after 5s
	setTimeout(() => {
		prometheus.stopCyclic();
	}, 3000);

//	prometheus.testSyncWithCyclicUpdate();
}

main();
