const {
	formRepository,
	userRepository,
	submissionRepository
} = require('../../repositories/')
const {
	makeForm,
	makeUser,
	makeFormSubmission
} = require('../../entities/')
const {
	getUser: getUserUseCase,
	updateUser: updateUserUseCase
} = require('../user/')
const { addSubmission: addSubmissionUseCase } = require('../submission/')

const { safeAsyncCall, safeSyncCall } = require('../../../helpers/utils-helper')
const {
	makeUserNotFoundError,
	makeInternalError,
	makeForbiddenError,
	makeFormNotFoundError,
	makeInvalidFormDataError,
	makeFormSubmissionValidationError,
	makeFormNotAcceptingSubmissionsError,
	makeFormAlreadySubmittedError,
} = require('../../../helpers/use-case-error-helper')

const makeAddForm = require('./add-form')
const makeUpdateForm = require('./update-form')
const makeGetForm = require('./get-form')
const makeGetFormsList = require('./get-forms-list')
const makeGetFormForSubmission = require('./get-form-for-submission')
const makePostForm = require('./post-form')
const makeDeleteForm = require('./delete-form')

const DataValidator = require('../../../helpers/data-validation-helper')
const dataValidator = new DataValidator()

const addForm = makeAddForm({
	formRepository,
	userRepository,

	makeForm,
	makeUser,

	safeAsyncCall,
	safeSyncCall,
	dataValidator,

	makeUserNotFoundError,
	makeInternalError,
	makeInvalidFormDataError,

	getUserUseCase,
	updateUserUseCase,
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
	makeFormNotAcceptingSubmissionsError,
	makeFormAlreadySubmittedError,
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

	addSubmissionUseCase,

	dataValidator,
})
const deleteForm = makeDeleteForm({
	formRepository,

	makeUser,
	makeForm,

	safeAsyncCall,
	makeForbiddenError,
	makeInternalError,

	getUserUseCase,
	getFormUseCase: getForm,
})

module.exports = {
	addForm,
	updateForm,
	getForm,
	getFormsList,
	getFormForSubmission,
	postForm,
	deleteForm,
}