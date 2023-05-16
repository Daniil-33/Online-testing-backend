const {
	userMongoRepository,
	formsMongoRepository,
	submissionMongoRepository
} = require('./mongo')

module.exports = {
	userRepositoryImplementation: userMongoRepository,
	formRepositoryImplementation: formsMongoRepository,
	submissionRepositoryImplementation: submissionMongoRepository
}