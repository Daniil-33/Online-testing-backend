require('dotenv').config();

const { defaultLogger: Logger } = require('./src/services/logger-service');

const express = require("express");
const cors = require('cors');
const bodyParser = require("body-parser");
const PORT = process.env.PORT || 5000;

const app = express();

app.use(cors({ origin: '*' }));
app.use(express.json());

const jsonParser = bodyParser.json();

const {
	userRouter,
	formRouter,
	submissionRouter
} = require('./src/interfaces/routes/');

app.use("/api/user", jsonParser, userRouter);
app.use("/api/form", jsonParser, formRouter);
app.use("/api/submission", jsonParser, submissionRouter);

function startApplication() {
	try {
		Logger.info('Starting server.')

		app.listen(PORT, () => {
			Logger.info(`Server started on port ${PORT}`);
		});

		Logger.info('Server started successfully.')
	} catch (e) {
		Logger.error('Server failed to start. Retrying in 60 seconds.')
		setTimeout(startApplication, 60000)
	}
}

startApplication();