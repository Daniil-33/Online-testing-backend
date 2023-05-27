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

const {
	getUser: getUserUseCase,
	updateUser: updateUserUseCase,
} = require('../user/');

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
const makeUpdateSubmissionPoints = require('./update-submission-points');
const makeGetSubmission = require('./get-submission');
const makeGetSubmissionsAnalytic = require('./get-submissions-analytic');

// This function needs to resolve circular dependencies
const getFormsUseCases = () => {
	const {
		getForm: getFormUseCase,
		getFormsList: getFormsListUseCase,
		updateForm: updateFormUseCase,
	} = require('../form/');

	return {
		getFormUseCase,
		getFormsListUseCase,
		updateFormUseCase,
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

	getFormsUseCases,
	getUserUseCase,
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
	getFormsUseCases,
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

const updateSubmissionPoints = makeUpdateSubmissionPoints({
	submissionRepository,

	safeAsyncCall,

	makeForm,
	makeFormSubmission,

	makeInternalError,
	makeForbiddenError,

	getSubmissionUseCase: getSubmission,

	getFormsUseCases,
})

const deleteSubmission = makeDeleteSubmission({
	submissionRepository,

	safeAsyncCall,

	makeForm,
	makeFormSubmission,
	makeUser,

	makeInternalError,
	makeForbiddenError,

	getSubmissionUseCase: getSubmission,
	getUserUseCase,
	updateUserUseCase,
	getFormsUseCases,
})

const getSubmissionsAnalytic = makeGetSubmissionsAnalytic({
	submissionRepository,

	safeAsyncCall,
	uniqArrayItems,

	makeForm,
	makeFormSubmission,

	makeInternalError,
	makeForbiddenError,

	getFormsUseCases,
	getUserUseCase,
})

module.exports = {
	getSubmissionsList,
	addSubmission,
	getSubmission,
	deleteSubmission,
	updateSubmissionPoints,
	getSubmissionsAnalytic,
}
