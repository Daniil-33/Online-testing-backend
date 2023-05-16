const { formRepository, userRepository, submissionRepository } = require('../../repositories/')
const { makeForm, makeUser, makeFormSubmission } = require('../../entities/')

const makeAddForm = require('./add-form')
const makeUpdateForm = require('./update-form')
const makeGetForm = require('./get-form')
const makeGetFormsList = require('./get-forms-list')
const makeGetFormForSubmission = require('./get-form-for-submission')
const makePostForm = require('./post-form')

const { safeAsyncCall, safeSyncCall } = require('../../../helpers/utils-helper')

const {
	makeUserNotFoundError,
	makeInternalError,
	makeForbiddenError,
	makeFormNotFoundError,
	makeInvalidFormDataError,
	makeFormSubmissionValidationError
} = require('../../../helpers/use-case-error-helper')

const DataValidator = require('../../../helpers/data-validation-helper')
const dataValidator = new DataValidator()

const addForm = makeAddForm({
	formRepository,
	userRepository,

	makeForm,
	makeUser,

	safeAsyncCall,
	safeSyncCall,

	makeUserNotFoundError,
	makeInternalError,
	makeInvalidFormDataError,

	dataValidator,
})
const getFormsList = makeGetFormsList({
	userRepository,
	formRepository,

	makeUser,

	safeAsyncCall,
	makeUserNotFoundError,
	makeInternalError,
})

const getForm = makeGetForm({
	userRepository,
	formRepository,

	makeUser,
	makeForm,

	safeAsyncCall,
	makeUserNotFoundError,
	makeForbiddenError,
	makeFormNotFoundError,
	makeInternalError,
})

const getFormForSubmission = makeGetFormForSubmission({
	userRepository,
	formRepository,

	makeUser,
	makeForm,

	safeAsyncCall,
	makeUserNotFoundError,
	makeForbiddenError,
	makeFormNotFoundError,
	makeInternalError,
})

const updateForm = makeUpdateForm({
	userRepository,
	formRepository,

	makeUser,
	makeForm,

	safeAsyncCall,
	safeSyncCall,
	makeUserNotFoundError,
	makeForbiddenError,
	makeFormNotFoundError,
	makeInternalError,

	dataValidator,
})
const postForm = makePostForm({
	formRepository,
	userRepository,
	submissionRepository,

	makeForm,
	makeUser,
	makeFormSubmission,

	safeAsyncCall,
	safeSyncCall,

	makeUserNotFoundError,
	makeFormNotFoundError,
	makeInternalError,
	makeFormSubmissionValidationError,
	makeInvalidFormDataError,

	dataValidator,
})

module.exports = {
	addForm,
	updateForm,
	getForm,
	getFormsList,
	getFormForSubmission,
	postForm,
}