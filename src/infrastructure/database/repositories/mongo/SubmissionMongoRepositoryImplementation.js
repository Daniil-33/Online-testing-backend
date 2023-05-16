module.exports = function buildSubmissionMongoRepository ({ connectMongoDb, submissionCollectionName }) {
	return function () {
		return new Promise(async (resolve, reject) => {
			const db = await connectMongoDb()

			resolve(db.collection(submissionCollectionName))
		})
	}
}