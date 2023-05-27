module.exports = function makeFormController({
	makeHttpError,
	makeHttpResponse,

	safeAsyncCall,
	translateInterfaceErrorCodeToHttpStatusCode,

	authorizeControllerHelper,

	addFormUseCase,
	getFormUseCase,
	getFormsListUseCase,
	updateFormUseCase,
	postFormUseCase,
	deleteFormUseCase,
	getFormForSubmissionUseCase,

	getSubmissionsListUseCase,
	deleteSubmissionUseCase,
	getSubmissionsAnalyticUseCase,
}) {

	/*
		POST - /form (create form)
		POST - /form/:id (submit form)

		GET - /form (get forms list for current user)
		GET - /form/:id (get form)
		PUT - /form/:id (update form)
		DELETE - /form/:id (delete form)

		GET - /form/:id/submissions (get submissions list for form)
		DELETE - /form/:id/submissions/:id (delete submission)
		GET - /form/:id/submissions/analytic (get submissions analytic for form)
	*/

	return {
		createForm,
		submitForm,

		getForm,
		getFormsList,
		editForm,
		deleteForm,
		getFormSubmissionsList,
		deleteSubmission,
		getSubmissionsAnalytic,
	}

	async function createForm(httpRequest) {
		const { ...formData } = httpRequest.body;
		const { authorization: token } = httpRequest.headers;

		const [userData, authorizationHttpError] = await safeAsyncCall(authorizeControllerHelper(token))

		if (authorizationHttpError) {
			return authorizationHttpError
		}

		if (!formData) {
			return makeHttpError({
				errorData: {
					message: 'Bad request. Please provide form information.'
				},
				code: 400,
			});
		}

		const [form, formCreateError] = await safeAsyncCall(addFormUseCase({ formData, userId: userData._id }))

		if (formCreateError) {
			return makeHttpError({
				errorData: formCreateError.toPlainObject(),
				code: translateInterfaceErrorCodeToHttpStatusCode(formCreateError.getCode()),
			});
		}

		return makeHttpResponse(form)
	}

	async function editForm(httpRequest) {
		const { ...formData } = httpRequest.body;
		const { authorization: token } = httpRequest.headers;
		const { id: formId } = httpRequest.pathParams;

		const [userData, authorizationHttpError] = await safeAsyncCall(authorizeControllerHelper(token))

		if (authorizationHttpError) {
			return authorizationHttpError
		}

		if (!formId) {
			return makeHttpError({
				errorData: {
					message: 'Bad request. Please provide form id.'
				},
				code: 400,
			});
		}

		if (!formData) {
			return makeHttpError({
				errorData: {
					message: 'Bad request. Please provide form information.'
				},
				code: 400,
			});
		}

		const [result, formEditError] = await safeAsyncCall(updateFormUseCase({ formData, formId, userId: userData._id }))

		if (formEditError) {
			return makeHttpError({
				errorData: formEditError.toPlainObject(),
				code: translateInterfaceErrorCodeToHttpStatusCode(formEditError.getCode()),
			});
		}

		return makeHttpResponse(result)
	}

	async function getForm(httpRequest) {
		const { authorization: token } = httpRequest.headers;
		const { id: formId } = httpRequest.pathParams;
		const { format } = httpRequest.queryParams;

		const [userData, authorizationHttpError] = await safeAsyncCall(authorizeControllerHelper(token))

		if (authorizationHttpError) {
			return authorizationHttpError
		}

		if (format !== undefined) {
			if (format === 'submission') {
				const [form, formError] = await safeAsyncCall(getFormForSubmissionUseCase({ formId, userId: userData._id }))

				if (formError) {
					return makeHttpError({
						errorData: formError.toPlainObject(),
						code: translateInterfaceErrorCodeToHttpStatusCode(formError.getCode()),
					});
				}

				return makeHttpResponse(form)
			} else {
				return makeHttpError({
					errorData: {
						message: 'Bad request. Invalid format.'
					},
					code: 400,
				});
			}
		}

		const [form, formError] = await safeAsyncCall(getFormUseCase({ formId, userId: userData._id }))

		if (formError) {
			return makeHttpError({
				errorData: formError.toPlainObject(),
				code: translateInterfaceErrorCodeToHttpStatusCode(formError.getCode()),
			});
		}

		return makeHttpResponse(form)
	}

	async function getFormsList(httpRequest) {
		const { authorization: token } = httpRequest.headers;
		const [userData, authorizationHttpError] = await safeAsyncCall(authorizeControllerHelper(token))

		if (authorizationHttpError) {
			return authorizationHttpError
		}

		const [formsList, formsListError] = await safeAsyncCall(getFormsListUseCase({ userId: userData._id }))

		if (formsListError) {
			return makeHttpError({
				errorData: formsListError.toPlainObject(),
				code: translateInterfaceErrorCodeToHttpStatusCode(formsListError.getCode()),
			});
		}

		return makeHttpResponse(formsList)
	}

	async function deleteForm(httpRequest) {
		const { authorization: token } = httpRequest.headers;
		const { id: formId } = httpRequest.pathParams;

		const [userData, authorizationHttpError] = await safeAsyncCall(authorizeControllerHelper(token))

		if (authorizationHttpError) {
			return authorizationHttpError
		}

		const [deleteResult, deleteError] = await safeAsyncCall(deleteFormUseCase({ formId, userId: userData._id }))

		if (deleteError) {
			return makeHttpError({
				errorData: deleteError.toPlainObject(),
				code: translateInterfaceErrorCodeToHttpStatusCode(deleteError.getCode()),
			});
		}

		return makeHttpResponse(deleteResult)
	}

	async function submitForm(httpRequest) {
		const { authorization: token } = httpRequest.headers;
		const { id: formId } = httpRequest.pathParams;
		const { answers } = httpRequest.body;

		const [userData, authorizationHttpError] = await safeAsyncCall(authorizeControllerHelper(token))

		if (authorizationHttpError) {
			return authorizationHttpError
		}

		const [submitResult, submitError] = await safeAsyncCall(postFormUseCase({
			userId: userData._id,
			formData: {
				formId,
				answers,
			},
		}))

		if (submitError) {
			return makeHttpError({
				errorData: submitError.toPlainObject(),
				code: translateInterfaceErrorCodeToHttpStatusCode(submitError.getCode()),
			});
		}

		return makeHttpResponse(submitResult)
	}

	async function getFormSubmissionsList(httpRequest) {
		const { authorization: token } = httpRequest.headers;
		const { id: formId } = httpRequest.pathParams;

		const [userData, authorizationHttpError] = await safeAsyncCall(authorizeControllerHelper(token))

		if (authorizationHttpError) {
			return authorizationHttpError
		}

		const [submissions, submissionsError] = await safeAsyncCall(getSubmissionsListUseCase({ formId, userId: userData._id }))

		if (submissionsError) {
			return makeHttpError({
				errorData: submissionsError.toPlainObject(),
				code: translateInterfaceErrorCodeToHttpStatusCode(submissionsError.getCode()),
			});
		}

		return makeHttpResponse(submissions)
	}

	async function deleteSubmission(httpRequest) {
		const { authorization: token } = httpRequest.headers;
		const { submissionId } = httpRequest.pathParams;

		const [userData, authorizationHttpError] = await safeAsyncCall(authorizeControllerHelper(token))

		if (authorizationHttpError) {
			return authorizationHttpError
		}

		const [deleteResult, deleteError] = await safeAsyncCall(deleteSubmissionUseCase({ submissionId, userId: userData._id }))

		if (deleteError) {
			return makeHttpError({
				errorData: deleteError.toPlainObject(),
				code: translateInterfaceErrorCodeToHttpStatusCode(deleteError.getCode()),
			});
		}

		return makeHttpResponse(deleteResult)
	}

	async function getSubmissionsAnalytic(httpRequest) {
		const { authorization: token } = httpRequest.headers;
		const { id: formId } = httpRequest.pathParams;

		const [userData, authorizationHttpError] = await safeAsyncCall(authorizeControllerHelper(token))

		if (authorizationHttpError) {
			return authorizationHttpError
		}

		const [analytic, analyticError] = await safeAsyncCall(getSubmissionsAnalyticUseCase({ formId, userId: userData._id }))

		if (analyticError) {
			return makeHttpError({
				errorData: analyticError.toPlainObject(),
				code: translateInterfaceErrorCodeToHttpStatusCode(analyticError.getCode()),
			});
		}

		return makeHttpResponse(analytic)
	}
}