const Crypto = Object.freeze({
	makeGenSalt,
	hash,
	compare
});

module.exports = Crypto;

const bcrypt = require('bcryptjs');

function makeGenSalt (saltRounds=10) {
	return new Promise((resolve, reject) => {
		bcrypt.genSalt(saltRounds, (error, salt) => {
			if (error) {
				return reject(error);
			}

			resolve(salt);
		});
	});
}

function hash (value, salt) {
	return new Promise((resolve, reject) => {
		bcrypt.hash(value, salt, (err, hash) => {
			if (err) {
				return reject(err);
			}

			resolve(hash);
		});
	});
}

function compare (a, b) {
	return new Promise((resolve, reject) => {
		bcrypt.compare(a, b, (err, isMatch) => {
			if (err) {
				return reject(err)
			}

			resolve(isMatch);
		})
	})
}