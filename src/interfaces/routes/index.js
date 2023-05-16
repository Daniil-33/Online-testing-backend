const router = require('express').Router;

const { adaptExpressRequest, makeExpressResponseHandler, handleRouteRequest } = require('../../helpers/express-helper');

const { userController, formController } = require('../../interfaces/controllers');

const makeUserRouter = require('./userRouter');
const makeFormRouter = require('./formRouter');

const userRouter = makeUserRouter({
	router,
	userController,
	adaptExpressRequest,
	makeExpressResponseHandler
})
console.log('userRouter', handleRouteRequest);
const formRouter = makeFormRouter({
	router,
	formController,
	handleRouteRequest
})

module.exports = {
	userRouter,
	formRouter
}