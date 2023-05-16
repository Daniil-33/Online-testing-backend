const makeGetSubmissionList = require('./get-submission-list');

const { makeForm } = require('../../entities');
const { submissionRepository, formRepository } = require('../../repositories');

const { safeAsyncCall } = require('../../../helpers/utils-helper');
const {
	makeInternalError,
	makeFormNotFoundError,
	makeForbiddenError,
} = require('../../../helpers/use-case-error-helper');

const getSubmissionList = makeGetSubmissionList({
	submissionRepository,
	formRepository,

	safeAsyncCall,

	makeForm,

	makeInternalError,
	makeFormNotFoundError,
	makeForbiddenError,
});

module.exports = {
	getSubmissionList,
}
