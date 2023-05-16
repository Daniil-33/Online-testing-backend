function isEmailValid (email) {
	return /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(email)
}

function safeAsyncCall (promise) {
	return new Promise((resolve, reject) => {
		promise
			.then((result) => {
				resolve([result, null])
			})
			.catch((error) => {
				resolve([null, error])
			})
	})
}

function safeSyncCall (fn) {
	try {
		return [fn(), null]
	} catch (error) {
		return [null, error]
	}
}

module.exports = {
	isEmailValid,
	safeAsyncCall,
	safeSyncCall,
}