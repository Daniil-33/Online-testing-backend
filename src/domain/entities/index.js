const Id = require('../../helpers/id-helper');
const { isEmailValid } = require('../../helpers/utils-helper');

const buildMakeUser = require('./user');
const buildMakeFormQuestion = require('./form-question');
const buildMakeForm = require('./form');
const buildMakeFormSubmission = require('./form-submission');

const makeUser = buildMakeUser({ Id, isEmailValid });
const makeFormQuestion = buildMakeFormQuestion({ Id });
const makeForm = buildMakeForm({ Id, makeFormQuestion });
const makeFormSubmission = buildMakeFormSubmission({ Id, makeForm });

module.exports = {
	makeUser,
	makeForm,
	makeFormSubmission
}