function makeHttpError ({ errorData, code }) {
	return {
		headers: {
			'Content-Type': 'application/json'
		},
		statusCode: code || 500,
		data: JSON.stringify({
			success: false,
			...errorData
		})
	}
}

function makeHttpResponse (data) {
	return {
		headers: {
			'Content-Type': 'application/json'
		},
		statusCode: 200,
		data: JSON.stringify({
			success: true,
			...data
		})
	}
}

function fallbackServerError () {
	return makeHttpError({
		errorData: {
			message: 'Internal server error.'
		},
		code: 500,
	});
}

module.exports.makeHttpError = makeHttpError
module.exports.makeHttpResponse = makeHttpResponse
module.exports.fallbackServerError = fallbackServerError

