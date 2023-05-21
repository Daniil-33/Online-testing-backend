function adaptExpressRequest (req={}) {
	return Object.freeze({
		path: req.path,
		method: req.method,
		pathParams: req.params,
		queryParams: req.query,
		body: req.body,
		headers: req.headers,
	})
}

function makeExpressResponseHandler (res={}) {
	return function handle({ headers, statusCode, data }) {
		res.set(headers)
		res.status(statusCode || 500)
		res.send(data)
	}
}

function handleRouteRequest (req={}, res={}, controllerMethod) {
	const httpRequest = adaptExpressRequest(req)
	const httpResponseHandler = makeExpressResponseHandler(res)

	controllerMethod(httpRequest)
		.then(httpResponse => httpResponseHandler(httpResponse))
		.catch(err => httpResponseHandler(err))
}

module.exports = {
	adaptExpressRequest,
	makeExpressResponseHandler,
	handleRouteRequest
}