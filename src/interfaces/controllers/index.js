require('dotenv').config()

const { safeAsyncCall } = require('../../helpers/utils-helper');
const { translateInterfaceErrorCodeToHttpStatusCode } = require('../../helpers/use-case-error-helper');
const { makeHttpError, makeHttpResponse } = require('../../helpers/http-helper');

const JWT = require('../../helpers/jwt-helper')

function parseToken (token) {
	return JWT.verify(token, process.env.JWT_SECRET)
}


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

const makeUserController = require('./userController');
const makeFormController = require('./formController');

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
	parseToken,

	addFormUseCase: addForm,
	getFormUseCase: getForm,
	getFormsListUseCase: getFormsList,
	updateFormUseCase: updateForm,
	getFormForSubmissionUseCase: getFormForSubmission,
	postFormUseCase: postForm,
	getUserUseCase: getUser
})

module.exports = {
	userController,
	formController
}