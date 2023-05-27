require('dotenv').config()

const { safeAsyncCall } = require('../../helpers/utils-helper');
const { translateInterfaceErrorCodeToHttpStatusCode } = require('../../helpers/use-case-error-helper');
const { makeHttpError, makeHttpResponse } = require('../../helpers/http-helper');

const {
	userRegister: userRegisterUseCase,
	userLoginWithCredentials: userLoginWithCredentialsUseCase,
	userLoginWithToken: userLoginWithTokenUseCase,
	getUser,
} = require('../../domain/use-cases/user');

const {
	addForm: addFormUseCase,
	updateForm: updateFormUseCase,
	getForm: getFormUseCase,
	getFormsList: getFormsListUseCase,
	getFormForSubmission: getFormForSubmissionUseCase,
	postForm: postFormUseCase,
	deleteForm: deleteFormUseCase,
} = require('../../domain/use-cases/form');

const {
	getSubmissionsList: getSubmissionsListUseCase,
	getSubmission: getSubmissionUseCase,
	updateSubmissionPoints: updateSubmissionPointsUseCase,
	deleteSubmission: deleteSubmissionUseCase,
	getSubmissionsAnalytic: getSubmissionsAnalyticUseCase,
} = require('../../domain/use-cases/submission');

const makeUserController = require('./userController');
const makeFormController = require('./formController');
const makeSubmissionController = require('./submissionController');

function authorizeControllerHelper (token) {
	return new Promise(async (resolve, reject) => {
		const [userData, userError] = await safeAsyncCall(getUser({ token }))

		if (userError) {
			return reject(makeHttpError({
				errorData: {
					...userError.toPlainObject(),
					message: `Not authorized. ${userError.getMessage()}`
				},
				code: 401,
			}));
		}

		return resolve(userData)
	})
}

const userController = makeUserController({
	makeHttpError,
	makeHttpResponse,

	safeAsyncCall,
	translateInterfaceErrorCodeToHttpStatusCode,

	userRegisterUseCase,
	userLoginWithCredentialsUseCase,
	userLoginWithTokenUseCase,
})

const formController = makeFormController({
	makeHttpError,
	makeHttpResponse,

	safeAsyncCall,
	translateInterfaceErrorCodeToHttpStatusCode,
	authorizeControllerHelper,

	addFormUseCase,
	getFormUseCase,
	getFormsListUseCase,
	updateFormUseCase,
	getFormForSubmissionUseCase,
	postFormUseCase,
	deleteFormUseCase,

	getSubmissionsListUseCase,
	deleteSubmissionUseCase,
	getSubmissionsAnalyticUseCase,
})

const submissionController = makeSubmissionController({
	makeHttpError,
	makeHttpResponse,

	safeAsyncCall,
	translateInterfaceErrorCodeToHttpStatusCode,
	authorizeControllerHelper,

	getSubmissionUseCase,
	getSubmissionsListUseCase,
	updateSubmissionPointsUseCase,
	// deleteSubmissionUseCase,
})

module.exports = {
	userController,
	formController,
	submissionController
}