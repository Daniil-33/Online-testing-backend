module.exports = function buildUserMongoRepository ({ connectMongoDb, userCollectionName }) {
	return function () {
		return new Promise(async (resolve, reject) => {
			const db = await connectMongoDb()

			resolve(db.collection(userCollectionName))
		})
	}
}