require('dotenv').config()

const { buildConnectMongoDb } = require('./mongo-connector')

const connectMongoDb = buildConnectMongoDb({
	dbUrl: process.env.MONGO_DB_URL,
	dbName: process.env.MONGO_DB_NAME
})

module.exports = {
	connectMongoDb
}