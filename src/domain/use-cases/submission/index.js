
const { makeForm, makeUser } = require('../../entities');
const {
	submissionRepository,
	formRepository,
	userRepository
} = require('../../repositories');
const { getUser: getUserUseCase } = require('../user/');
const { getForm: getFormUseCase } = require('../form/');

const {
	makeInternalError,
	makeFormNotFoundError,
	makeForbiddenError,
	makeFormSubmissionValidationError,
} = require('../../../helpers/use-case-error-helper');

const { safeAsyncCall, safeSyncCall } = require('../../../helpers/utils-helper');

const makeGetSubmissionList = require('./get-submissions-list');
const makeAddSubmission = require('./add-submission');
const makeDeleteSubmission = require('./delete-submission');



const getSubmissionList = makeGetSubmissionList({
	submissionRepository,
	formRepository,

	safeAsyncCall,

	makeForm,

	makeInternalError,
	makeFormNotFoundError,
	makeForbiddenError,
});

const addSubmission = makeAddSubmission({
	submissionRepository,
	formRepository,
	userRepository,

	makeUser,

	safeAsyncCall,
	safeSyncCall,

	makeInternalError,
	makeFormSubmissionValidationError,

	getUserUseCase,
})

const deleteSubmission = makeDeleteSubmission({
	submissionRepository,

	safeAsyncCall,

	makeForm,
	makeSubmission,

	makeInternalError,
	makeForbiddenError,

	getSubmissionUseCase,
	getFormUseCase,
})

module.exports = {
	getSubmissionList,
	addSubmission,
}
