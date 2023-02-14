'use strict'

const { inspect } = require('node:util');

// NOTE: Prometheus does not show the real thing, instead it captures
// only userdefined calls, but it helps to understand a little bit better.
// It would be great to get the real underlaying structures that really hold
// the data. The problem is to identify each promise since they all look the
// same from the inspector.

// TODO: can be capsulated for more safety

const util = require('node:util');
// const { getPromiseDetails, PromiseStatus } = require('react-promise-utils/getPromiseDetails');

class Prometheus {

	constructor() {
		this.DebugLevel = 0;
		this.Promises = new Map();// new List([]);
		this.Cyclic = undefined;
		this.DeleteWhenFinished = false;

		// WARNING: not sure if this is officially allowed:
		Promise.prototype.ID = undefined;
	}

	startCyclic(delay = 1000) {

		// delay ||= 1000;

		if (this.DebugLevel > 0) console.log('Starting cycylic task with a delay of ' + delay + ' ms.');
		// this.Delay = delay;
		this.Cyclic = setInterval(() => {
			prometheus.showRegisteredPromisesSync();
		}, delay);
	}

	stopCyclic() {

		if (this.DebugLevel > 0) console.log('Stopping cycylic task.');
		if (this.Cyclic) {
			clearInterval(this.Cyclic);
		}
	}

	getPromiseStateAsync(promise) {

		const t = {};

		return Promise.race([promise, t])
			.then((result) => {
				return (result === t)? "pending" : "resolved"
			}, (error) => {
				return "rejected"
			});
	}

	// TODO:
	info2() {
		let info = process.binding('util').getPromiseDetails(Promise.resolve({data: [1,2,3]}));
		console.log(info);

		// process.binding('util').getPromiseDetails

	}

	getPromiseStateSync(promise) {

		if (!promise) throw('ERROR: no promise');

		const s = inspect(promise, { sorted:true });
		// console.log(s);

		// NOTE: results in either of:
		//
		// 'Promise { 'result' }'
		// 'Promise { <rejected> 'cause' }'
		// 'Promise { <pending> }'
		//
		// where result and cause are any objects.

		const regexpString = String.raw`^ Promise \s* \{ \s* (?<state><[^>]+>)? (\s+ (?<obj>.*))? (,\s*(?<data>.*))? \s* \} $`;
		// console.log(regexpString);

		const regexpString2 = regexpString.split(' ').join('');
		// console.log(regexpString2);

		const regex = new RegExp( regexpString2, 'g' );
		// console.log(regex);

		const iter = s.matchAll(regex);
		const match = Array.from(iter);

		if (match && (match.length > 0)) {
			const state = match[0].groups['state'];
			// console.dir( state + ' ' + match[0].groups['obj'] );
			switch (state) {
				case '<pending>':
					return 'pending';

				case '<rejected>':
					return 'rejected';

				default:
					return 'resolved';
			}
		}

		throw('Error: Could not analyze Promise! ' + s);
	}

	async showPromises2() {

		// TODO:
		let s = 'Promises [' + this.Promises.size + ']\n';

		for (const [key, promise] of this.Promises) {

			let r;
			await this.getPromiseState(promise).then((data) => {
				r = data;
			})

			this.getPromiseStateSync(promise);

			s += '    ID: ' + promise.ID + ' Source: ' + promise.Source + ' State: ' + r + '\n'
		}
		console.log(s);
	}

	showRegisteredPromisesSync() {

		let s = this.Promises.size + ' Promise(s) registered:\n';

		for (const [key, promise] of this.Promises) {

			const state = this.getPromiseStateSync(promise);
			s += '    ID: ' + promise.ID + ' State: ' + state + '\n'
		}
		console.log(s);
	}

	isRegistered(promise) {
		return( this.Promises.has(promise.ID) );
	}

	register(promise, id) {

		if (promise.ID || promise.Source) throw('ERROR: promise not clean!');

		promise.ID = id;

		if (this.isRegistered(promise)) throw('ERROR: Promise already exists!');

		if (this.DebugLevel > 0) console.log('Adding a watch to a promise with ID ' + promise.ID + ' from ' + promise.Source);
		this.Promises.set(promise.ID, promise);

		return promise;
	}

	unregister(promise) {

		if (!this.isRegistered(promise.ID)) throw('ERROR: Promise not found!');

		if (this.DebugLevel > 0) this.log('Removing promise with ID ' + promise.id);
		// this.Promises = this.Promises.filter(item => item[2] !== promise);
		delete this.Promises(promise);
	}

	process( promise, callback ) {

		if (this.DebugLevel > 0) console.log('Procerssing promise with ID ' + promise.ID);

		if (this.DeleteWhenFinished) this.remove(promise);

		return ( () => {
			if (this.DebugLevel > 0) console.log('callback');
			callback();
		}).bind(promise);
	}
}

const prometheus = new Prometheus();

module.exports = {
	prometheus
};
