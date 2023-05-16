const { MongoClient } = require('mongodb')

module.exports.buildConnectMongoDb = function ({ dbUrl, dbName }) {
	return async function() {
		return new Promise(async (resolve, reject) => {
			const client = new MongoClient(dbUrl, {
				useNewUrlParser: true,
				useUnifiedTopology: true
			})
			await client.connect()

			const db = await client.db(dbName)

			resolve(db)
		})
	}
}