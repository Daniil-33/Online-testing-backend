module.exports = function makeSubmissionController({
	makeHttpError,
	makeHttpResponse,

	makeUser,

	safeAsyncCall,
	translateInterfaceErrorCodeToHttpStatusCode,

	getSubmissionUseCase,
	getSubmissionsListUseCase,
	updateSubmissionPointsUseCase,
	deleteSubmissionUseCase,

	authorizeControllerHelper,
	getUserUseCase,
}) {

	/*
		POST method here not implemented because it's handled by formController (POST - /form/:formId)

		GET - /submissions (get submissions list for current user)
		GET - /submissions/:submissionId (get submission by id)
		GET - /submissions/?formId (get submissions by formId)
		PUT - /submissions/:submissionId/update-points (update submission)
		DELETE - /submissions/:submissionId (delete submission)
	*/

	return {
		getSubmissionsList,
		getSubmission,
		updateSubmissionPoints,
		deleteSubmission,
	}

	function _createNotAuthorizedError(error) {
		return makeHttpError({
			errorData: {
				...error.toPlainObject(),
				message: `Not authorized. ${error.getMessage()}`
			},
			code: 401,
		})
	}

	async function getSubmissionsList (httpRequest) {
		const { authorization: token } = httpRequest.headers;
		const { formId } = httpRequest.queryParams;

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

	async function getSubmission (httpRequest) {
		try {
			const { authorization: token } = httpRequest.headers;
			const { id: submissionId } = httpRequest.pathParams;
	
			const [userData, authorizationHttpError] = await safeAsyncCall(authorizeControllerHelper(token))

			if (authorizationHttpError) {
				return authorizationHttpError
			}

			const [submission, submissionError] = await safeAsyncCall(getSubmissionUseCase({ submissionId, userId: userData._id }))
	
			if (submissionError) {
				return makeHttpError({
					errorData: submissionError.toPlainObject(),
					code: translateInterfaceErrorCodeToHttpStatusCode(submissionError.getCode()),
				});
			}
	
			return makeHttpResponse(submission)
		} catch (error) {
			console.log(error, error)
		}
	}

	async function updateSubmissionPoints (httpRequest) {
		const { authorization: token } = httpRequest.headers;
		const { id: submissionId } = httpRequest.pathParams;
		const { ...pointsData } = httpRequest.body;

		const [userData, authorizationHttpError] = await safeAsyncCall(authorizeControllerHelper(token))

		if (authorizationHttpError) {
			return authorizationHttpError
		}

		const [submission, submissionError] = await safeAsyncCall(updateSubmissionPointsUseCase({ submissionId, userId: userData._id, ...pointsData }))

		if (submissionError) {
			return makeHttpError({
				errorData: submissionError.toPlainObject(),
				code: translateInterfaceErrorCodeToHttpStatusCode(submissionError.getCode()),
			});
		}

		return makeHttpResponse(submission)
	}

	async function deleteSubmission (httpRequest) {
		const { authorization: token } = httpRequest.headers;
		const { id: submissionId } = httpRequest.pathParams;

		const [userData, authorizationHttpError] = await safeAsyncCall(authorizeControllerHelper(token))

		if (authorizationHttpError) {
			return authorizationHttpError
		}

		const [deleteResult, deleteSubmissionError] = await safeAsyncCall(deleteSubmissionUseCase({ submissionId, userId: userData._id }))

		if (deleteSubmissionError) {
			return makeHttpError({
				errorData: deleteSubmissionError.toPlainObject(),
				code: translateInterfaceErrorCodeToHttpStatusCode(deleteSubmissionError.getCode()),
			});
		}

		return makeHttpResponse(deleteResult)
	}

}