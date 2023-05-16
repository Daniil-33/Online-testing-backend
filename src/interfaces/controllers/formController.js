module.exports = function makeFormController({
	makeHttpError,
	makeHttpResponse,

	safeAsyncCall,
	translateInterfaceErrorCodeToHttpStatusCode,
	parseToken,

	addFormUseCase,
	getFormUseCase,
	getFormsListUseCase,
	updateFormUseCase,
	getFormForSubmissionUseCase,
	getUserUseCase,
	postFormUseCase,
}) {

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

	return {
		createForm,
		submitForm,

		getForm,
		getFormsList,
		editForm,
		deleteForm,

		getSubmissionsList,
		getSubmission,
		editSubmission,
		deleteSubmission,
	}

	function _createNotAuthorizedError() {
		return makeHttpError({
			errorData: {
				message: 'Not authorized.'
			},
			code: 401,
		})
	}

	async function createForm(httpRequest) {
		const { ...formData } = httpRequest.body;
		const { authorization: token } = httpRequest.headers;

		if (!token) {
			return _createNotAuthorizedError()
		}
		const [decryptedToken, tokenError] = await safeAsyncCall(parseToken(token))

		if (tokenError) {
			return _createNotAuthorizedError()
		}

		const { id: userId } = decryptedToken

		if (!formData) {
			return makeHttpError({
				errorData: {
					message: 'Bad request. Please provide form information.'
				},
				code: 400,
			});
		}

		const [form, formCreateError] = await safeAsyncCall(addFormUseCase({ formData, userId }))

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

		if (!token) {
			return _createNotAuthorizedError()
		}
		const [decryptedToken, tokenError] = await safeAsyncCall(parseToken(token))

		if (tokenError) {
			return _createNotAuthorizedError()
		}

		const { id: userId } = decryptedToken

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

		const [result, formEditError] = await safeAsyncCall(updateFormUseCase({ formData, formId, userId }))

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

		const [user, userError] = await safeAsyncCall(getUserUseCase({ token }))

		if (userError) {
			return makeHttpError({
				errorData: {
					...userError.toPlainObject(),
					message: `Not authorized. ${userError.getMessage()}`
				},
				code: 401,
			});
		}

		if (format !== undefined) {
			if (format === 'submission') {
				const [form, formError] = await safeAsyncCall(getFormForSubmissionUseCase({ formId, userId: user.getId() }))

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

		const [form, formError] = await safeAsyncCall(getFormUseCase({ formId, userId: user.getId() }))

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

		const [user, userError] = await safeAsyncCall(getUserUseCase({ token }))

		if (userError) {
			return makeHttpError({
				errorData: {
					...userError.toPlainObject(),
					message: `Not authorized. ${userError.getMessage()}`
				},
				code: 401,
			});
		}

		const [formsList, formsListError] = await safeAsyncCall(getFormsListUseCase({ userId: user.getId() }))

		if (formsListError) {
			return makeHttpError({
				errorData: formsListError.toPlainObject(),
				code: translateInterfaceErrorCodeToHttpStatusCode(formsListError.getCode()),
			});
		}

		return makeHttpResponse(formsList)
	}

	async function deleteForm(httpRequest) {}

	async function submitForm(httpRequest) {
		const { authorization: token } = httpRequest.headers;
		const { id: formId } = httpRequest.pathParams;
		const { answers } = httpRequest.body;

		const [user, userError] = await safeAsyncCall(getUserUseCase({ token }))

		if (userError) {
			const userErrorData = userError.toPlainObject()

			return makeHttpError({
				errorData: {
					...userErrorData,
					message: `Not authorized. ${userError.getMessage()}`
				},
				code: translateInterfaceErrorCodeToHttpStatusCode(userError.getCode()),
			});
		}

		const [submitResult, submitError] = await safeAsyncCall(postFormUseCase({
			userId: user.getId(),
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

	function getSubmissionsList (httpRequest) {}

	function getSubmission (httpRequest) {}

	function editSubmission (httpRequest) {}

	function deleteSubmission (httpRequest) {}
}