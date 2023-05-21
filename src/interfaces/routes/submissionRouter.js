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
	routerInstance.get('/submissions/:submissionId', (req, res) => proxiedHandleRouteRequest(adaptExpressRequest(req), res, formController.getSubmission))
	routerInstance.put('/submissions/:submissionId/update-points', (req, res) => proxiedHandleRouteRequest(adaptExpressRequest(req), res, formController.updateSubmissionPoints))
	routerInstance.delete('/submissions/:submissionId', (req, res) => proxiedHandleRouteRequest(adaptExpressRequest(req), res, formController.deleteSubmission))

	return routerInstance
}