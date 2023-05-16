const {
	userRepositoryImplementation,
	formRepositoryImplementation,
	submissionRepositoryImplementation,
} = require('../../infrastructure/database/repositories/')

const makeUserRepository = require('./user-repository')
const makeFormRepository = require('./form-repository')
const makeSubmissionRepository = require('./submission-repository')

const userRepository = makeUserRepository({ userRepositoryImplementation })
const formRepository = makeFormRepository({ formRepositoryImplementation })
const submissionRepository = makeSubmissionRepository({ submissionRepositoryImplementation })

module.exports = {
	userRepository,
	formRepository,
	submissionRepository,
}