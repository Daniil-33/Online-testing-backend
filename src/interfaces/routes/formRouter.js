module.exports = function makeUserRouter({
	router,
	formController,
	handleRouteRequest
}) {
	const routerInstance = router()

	/*
		POST - /form (create form)
		POST - /form/:id (submit form)

		GET - /form (get forms list for current user)
		GET - /form/:id (get form)
		PUT - /form/:id (update form)
		DELETE - /form/:id (delete form)

		GET - /form/:id/submissions (get submissions list for form)
		GET - /form/:id/submissions/:submissionId (get submission for form)
		PUT - /form/:id/submissions/:submissionId (update submission for form)
		DELETE - /form/:id/submissions/:submissionId (delete submission for form)
	*/
	console.log('formController', handleRouteRequest);
	routerInstance.post('/', (req, res) => handleRouteRequest(req, res, formController.createForm))
	routerInstance.post('/:id', (req, res) => handleRouteRequest(req, res, formController.submitForm))

	routerInstance.get('/', (req, res) => handleRouteRequest(req, res, formController.getFormsList))
	routerInstance.get('/:id', (req, res) => handleRouteRequest(req, res, formController.getForm))
	routerInstance.put('/:id', (req, res) => handleRouteRequest(req, res, formController.editForm))
	routerInstance.delete('/:id', (req, res) => handleRouteRequest(req, res, formController.deleteForm))

	routerInstance.get('/:id/submissions', (req, res) => handleRouteRequest(req, res, formController.getSubmissionsList))
	routerInstance.get('/:id/submissions/:submissionId', (req, res) => handleRouteRequest(req, res, formController.getSubmission))
	routerInstance.put('/:id/submissions/:submissionId', (req, res) => handleRouteRequest(req, res, formController.editSubmission))
	routerInstance.delete('/:id/submissions/:submissionId', (req, res) => handleRouteRequest(req, res, formController.deleteSubmission))


	return routerInstance
}