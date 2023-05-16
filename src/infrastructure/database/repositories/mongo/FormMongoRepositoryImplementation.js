module.exports = function buildFormMongoRepository ({ connectMongoDb, formCollectionName }) {
	return function () {
		return new Promise(async (resolve, reject) => {
			const db = await connectMongoDb()

			resolve(db.collection(formCollectionName))
		})
	}
}