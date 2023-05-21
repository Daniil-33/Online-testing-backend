const { defaultLogger: Logger } = require('../../services/logger-service');
const router = require('express').Router;

const {
	adaptExpressRequest,
	handleRouteRequest
} = require('../../helpers/express-helper');

const { fallbackServerError } = require('../../helpers/http-helper');

function handleRouteRequestProxy (func, errorCaseCallback=fallbackServerError) {
	return function () {
		try {
			return func(...arguments)
		} catch (e) {
			Logger.error(e.message)

			return errorCaseCallback(e)
		}
	}
}

const {
	userController,
	formController,
	submissionController,
} = require('../../interfaces/controllers');

const makeUserRouter = require('./userRouter');
const makeFormRouter = require('./formRouter');
const makeAddSubmissionRouter = require('./submissionRouter');

const userRouter = makeUserRouter({
	router,
	userController,
	adaptExpressRequest,
	handleRouteRequest,
	handleRouteRequestProxy,
})

const formRouter = makeFormRouter({
	router,
	formController,
	adaptExpressRequest,
	handleRouteRequest,
	handleRouteRequestProxy,
})

const submissionRouter = makeAddSubmissionRouter({
	router,
	submissionController,
	adaptExpressRequest,
	handleRouteRequest,
	handleRouteRequestProxy,
})

module.exports = {
	userRouter,
	formRouter,
	submissionRouter
}