module.exports.makeHttpError = function ({ errorData, code }) {
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

module.exports.makeHttpResponse = function (data) {
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