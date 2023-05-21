module.exports = function makeUserRouter({
	router,
	formController,
	adaptExpressRequest,
	handleRouteRequest,
	handleRouteRequestProxy,
}) {
	const routerInstance = router()
	const proxiedHandleRouteRequest = handleRouteRequestProxy(handleRouteRequest)

	/*
		POST - /form (create form)
		POST - /form/:id (submit form)

		GET - /form (get forms list for current user)
		GET - /form/:id (get form)
		PUT - /form/:id (update form)
		DELETE - /form/:id (delete form)
	*/
	routerInstance.post('/', (req, res) => proxiedHandleRouteRequest(adaptExpressRequest(req), res, formController.createForm))
	routerInstance.post('/:id', (req, res) => proxiedHandleRouteRequest(adaptExpressRequest(req), res, formController.submitForm))

	routerInstance.get('/', (req, res) => proxiedHandleRouteRequest(adaptExpressRequest(req), res, formController.getFormsList))
	routerInstance.get('/:id', (req, res) => proxiedHandleRouteRequest(adaptExpressRequest(req), res, formController.getForm))
	routerInstance.put('/:id', (req, res) => proxiedHandleRouteRequest(adaptExpressRequest(req), res, formController.editForm))
	routerInstance.delete('/:id', (req, res) => proxiedHandleRouteRequest(adaptExpressRequest(req), res, formController.deleteForm))

	return routerInstance
}