require('dotenv').config()

const { makeUser } = require('../../entities/')
const { userRepository } = require('../../repositories/')

// === crypto helper dependency start === //
const Crypto = require('../../../helpers/crypto-helper');

async function hashPassword (password) {
	const salt = await Crypto.makeGenSalt(+(process.env.CRYPTO_GEN_SALT))

	return Crypto.hash(password, salt)
}

function comparePasswords (password, hashedPassword) {
	return Crypto.compare(password, hashedPassword)
}
// === crypto helper dependency end === //

// === jwt helper dependency start === //
const JWT = require('../../../helpers/jwt-helper')

function makeJWTSing (data) {
	return JWT.sign(data, process.env.JWT_SECRET, { expiresIn: parseInt(process.env.JWT_EXPIRES_IN) })
}

function verifyJWT (token) {
	return JWT.verify(token, process.env.JWT_SECRET)
}
// === jwt helper dependency end === //

const {
	safeAsyncCall,
	safeSyncCall,
} = require('../../../helpers/utils-helper')

// === error helper dependency start === //
const {
	makeUserExistError,
	makeInvalidTokenError,
	makeUserNotFoundError,
	makeInvalidCredentialsError,
	makeInternalError,
} = require('../../../helpers/use-case-error-helper')
// === error helper dependency end === //

// ===data validator dependency start === //
const DataValidator = require('../../../helpers/data-validation-helper')

const dataValidator = new DataValidator()
// ===data validator dependency end === //

const makeUserRegister = require('./user-register')
const makeUserLoginWithCredentials = require('./user-login-with-credentials')
const makeUserLoginWithToken = require('./user-login-with-token')
const makeGetUser = require('./get-user')
const makeUpdateUser = require('./update-user')

const userRegister = makeUserRegister({
	userRepository,
	makeUser,
	makeJWTSing,
	hashPassword,

	safeAsyncCall,
	safeSyncCall,
	makeUserExistError,
	makeInvalidCredentialsError,
	makeInternalError,

	dataValidator,
})
const userLoginWithToken = makeUserLoginWithToken({
	userRepository,
	makeUser,
	makeJWTSing,
	verifyJWT,

	safeAsyncCall,
	safeSyncCall,

	makeInvalidTokenError,
	makeInternalError,
})
const userLoginWithCredentials = makeUserLoginWithCredentials({
	userRepository,
	makeUser,
	makeJWTSing,
	comparePasswords,

	safeAsyncCall,
	safeSyncCall,

	makeUserNotFoundError,
	makeInvalidCredentialsError,
	makeInternalError,

	dataValidator,
})
const getUser = makeGetUser({
	userRepository,
	makeUser,

	safeAsyncCall,
	verifyJWT,

	makeUserNotFoundError,
	makeInternalError,
})
const updateUser = makeUpdateUser({
	userRepository,
	makeUser,

	safeAsyncCall,
	safeSyncCall,
	dataValidator,

	makeInternalError,
	makeInvalidCredentialsError,
})

module.exports = {
	userRegister,
	userLoginWithCredentials,
	userLoginWithToken,
	getUser,
	updateUser
}