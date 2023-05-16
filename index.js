require('dotenv').config();

const express = require("express");
const cors = require('cors');
const bodyParser = require("body-parser");
const PORT = process.env.PORT || 5000;

const app = express();

app.use(cors({ origin: '*' }));
app.use(express.json());
// app.use(bodyParser.json());

const jsonParser = bodyParser.json();

const {
	userRouter,
	formRouter
} = require('./src/interfaces/routes/');

app.use("/api/user", jsonParser, userRouter);
app.use("/api/form", jsonParser, formRouter);

app.get('/', (req, res) => {
	res.send('Hello World!')
})

function startApplication() {
	app.listen(PORT, () => {
		console.log(`Server is running on port ${PORT}.`);
	});
}

startApplication();