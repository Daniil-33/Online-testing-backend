module.exports = function makeUserRouter({
	router,
	userController,
	adaptExpressRequest,
	handleRouteRequest,
	handleRouteRequestProxy,
}) {
	const routerInstance = router()
	const proxiedHandleRouteRequest = handleRouteRequestProxy(handleRouteRequest)

	routerInstance.post('/', (req, res) => proxiedHandleRouteRequest(adaptExpressRequest(req), res, userController.registerUser))
	routerInstance.get('/', (req, res) => proxiedHandleRouteRequest(adaptExpressRequest(req), res, userController.loginUser))

	return routerInstance
}