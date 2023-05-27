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

function uniqArrayItems (arr) {
	return [...new Set(arr)]
}

function shuffleArray(array) {
	let currentIndex = array.length,  randomIndex;

	// While there remain elements to shuffle.
	while (currentIndex != 0) {
		// Pick a remaining element.
		randomIndex = Math.floor(Math.random() * currentIndex);
		currentIndex--;

		// And swap it with the current element.
		[array[currentIndex], array[randomIndex]] = [
			array[randomIndex], array[currentIndex]
		];
	}

	return array;
  }

module.exports = {
	isEmailValid,
	safeAsyncCall,
	safeSyncCall,
	uniqArrayItems,
	shuffleArray,
}