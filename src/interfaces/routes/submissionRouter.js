module.exports = function makeUserRouter({
	router,
	submissionController,
	adaptExpressRequest,
	handleRouteRequest,
	handleRouteRequestProxy,
}) {
	const routerInstance = router()
	const proxiedHandleRouteRequest = handleRouteRequestProxy(handleRouteRequest)

	/*
		POST method here not implemented because it's handled by formController (POST - /form/:formId)

		GET - /submissions (get submissions list for current user)
		GET - /submissions/:submissionId (get submission by id)
		GET - /submissions/?formId (get submissions by formId)
		PUT - /submissions/:submissionId/update-points (update submission)
		DELETE - /submissions/:submissionId (delete submission)
	*/

	routerInstance.get('/', (req, res) => proxiedHandleRouteRequest(adaptExpressRequest(req), res, submissionController.getSubmissionsList))
	routerInstance.get('/:id', (req, res) => proxiedHandleRouteRequest(adaptExpressRequest(req), res, submissionController.getSubmission))
	routerInstance.put('/:id/update-points', (req, res) => proxiedHandleRouteRequest(adaptExpressRequest(req), res, submissionController.updateSubmissionPoints))
	routerInstance.delete('/:id', (req, res) => proxiedHandleRouteRequest(adaptExpressRequest(req), res, submissionController.deleteSubmission))

	return routerInstance
}