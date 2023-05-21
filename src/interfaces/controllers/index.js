require('dotenv').config()

const { safeAsyncCall } = require('../../helpers/utils-helper');
const { translateInterfaceErrorCodeToHttpStatusCode } = require('../../helpers/use-case-error-helper');
const { makeHttpError, makeHttpResponse } = require('../../helpers/http-helper');

const {
	userRegister,
	userLoginWithCredentials,
	userLoginWithToken,
	getUser,
} = require('../../domain/use-cases/user');

const {
	addForm,
	updateForm,
	getForm,
	getFormsList,
	getFormForSubmission,
	postForm,
} = require('../../domain/use-cases/form');

const {
	getSubmissionsList: getSubmissionsListUseCase,
	getSubmission: getSubmissionUseCase,
	deleteSubmission: deleteSubmissionUseCase,
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

	registerUserUseCase: userRegister,
	loginUserWithCredentialsUseCase: userLoginWithCredentials,
	loginUserWithTokenUseCase: userLoginWithToken,
})

const formController = makeFormController({
	makeHttpError,
	makeHttpResponse,

	safeAsyncCall,
	translateInterfaceErrorCodeToHttpStatusCode,
	authorizeControllerHelper,

	addFormUseCase: addForm,
	getFormUseCase: getForm,
	getFormsListUseCase: getFormsList,
	updateFormUseCase: updateForm,
	getFormForSubmissionUseCase: getFormForSubmission,
	postFormUseCase: postForm,
})

const submissionController = makeSubmissionController({
	makeHttpError,
	makeHttpResponse,

	safeAsyncCall,
	translateInterfaceErrorCodeToHttpStatusCode,
	authorizeControllerHelper,

	getSubmissionUseCase,
	getSubmissionsListUseCase,
	// updateSubmissionPointsUseCase,
	deleteSubmissionUseCase,
})

module.exports = {
	userController,
	formController,
	submissionController
}