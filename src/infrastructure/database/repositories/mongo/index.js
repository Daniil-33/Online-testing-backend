const { connectMongoDb } = require('../../database-connectors/')

const buildUserMongoRepository = require('./UserMongoRepositoryImplementation')
const buildFormMongoRepository = require('./FormMongoRepositoryImplementation')
const buildSubmissionMongoRepository = require('./SubmissionMongoRepositoryImplementation')


const USER_COLLECTION_NAME = 'users'
const FORM_COLLECTION_NAME = 'forms'
const SUBMISSION_COLLECTION_NAME = 'submissions'

const userMongoRepository = buildUserMongoRepository({
	connectMongoDb,
	userCollectionName: USER_COLLECTION_NAME
})

const formsMongoRepository = buildFormMongoRepository({
	connectMongoDb,
	formCollectionName: FORM_COLLECTION_NAME
})

const submissionMongoRepository = buildSubmissionMongoRepository({
	connectMongoDb,
	submissionCollectionName: SUBMISSION_COLLECTION_NAME
})

module.exports = {
	userMongoRepository,
	formsMongoRepository,
	submissionMongoRepository,
}
