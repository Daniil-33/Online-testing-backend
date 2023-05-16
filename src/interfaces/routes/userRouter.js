module.exports = function makeUserRouter({
	router,
	userController,
	adaptExpressRequest,
	makeExpressResponseHandler,
}) {
	const routerInstance = router()

	routerInstance.all('/', (req, res) => {
		const httpRequest = adaptExpressRequest(req)
		const httpResponseHandler = makeExpressResponseHandler(res)

		userController(httpRequest)
			.then(httpResponse => httpResponseHandler(httpResponse))
			.catch(err => httpResponseHandler(err))
	})

	return routerInstance
}