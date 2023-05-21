const {
	makeForm,
	makeUser,
	makeFormSubmission
} = require('../../entities');
const {
	submissionRepository,
	formRepository,
	userRepository
} = require('../../repositories');

const { getUser: getUserUseCase } = require('../user/');

const {
	makeInternalError,
	makeFormNotFoundError,
	makeForbiddenError,
	makeFormSubmissionValidationError,
} = require('../../../helpers/use-case-error-helper');

const {
	safeAsyncCall,
	safeSyncCall,
	uniqArrayItems
} = require('../../../helpers/utils-helper');

const makeGetSubmissionList = require('./get-submissions-list');
const makeAddSubmission = require('./add-submission');
const makeDeleteSubmission = require('./delete-submission');
const makeGetSubmission = require('./get-submission');

// This function needs to resolve circular dependencies
const getFormsUseCases = () => {
	const {
		getForm: getFormUseCase,
		getFormsList: getFormsListUseCase,
	} = require('../form/');

	return {
		getFormUseCase,
		getFormsListUseCase,
	}
}

const getSubmissionsList = makeGetSubmissionList({
	submissionRepository,
	formRepository,

	safeAsyncCall,
	uniqArrayItems,

	makeForm,
	makeFormSubmission,

	makeInternalError,
	makeFormNotFoundError,
	makeForbiddenError,

	getFormsUseCases
});

const addSubmission = makeAddSubmission({
	submissionRepository,
	formRepository,
	userRepository,

	makeUser,
	makeFormSubmission,

	safeAsyncCall,
	safeSyncCall,

	makeInternalError,
	makeFormSubmissionValidationError,

	getUserUseCase,
})

const getSubmission = makeGetSubmission({
	submissionRepository,
	makeFormSubmission,
	makeForm,

	safeAsyncCall,

	makeInternalError,
	makeForbiddenError,

	getFormsUseCases,
})

// const deleteSubmission = makeDeleteSubmission({
// 	submissionRepository,

// 	safeAsyncCall,

// 	makeForm: makeFormSubmission,
// 	makeSubmission: makeFormSubmission,

// 	makeInternalError,
// 	makeForbiddenError,

// 	getSubmissionUseCase,
// 	getFormUseCase,
// })

module.exports = {
	getSubmissionsList,
	addSubmission,
	getSubmission,
}
