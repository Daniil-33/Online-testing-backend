const JWT = Object.freeze({
	sign,
	verify
});

module.exports = JWT

const jwt = require('jsonwebtoken');

function sign (data, secret, config) {
	return jwt.sign(data, secret, config);
}

function verify (a, b) {
	return new Promise((resolve, reject) => {
		jwt.verify(a, b, (err, decoded) => {
			if (err) {
				return reject(err);
			}

			resolve(decoded);
		});
	});
}