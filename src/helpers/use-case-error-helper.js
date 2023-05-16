const USE_CASES_ERROR_CODES = {
	USER_ALREADY_EXISTS: 'USER_ALREADY_EXISTS',
	USER_NOT_FOUND: 'USER_NOT_FOUND',
	INVALID_TOKEN: 'INVALID_TOKEN',
	INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
	INTERNAL: 'INTERNAL',
	FORBIDDEN: 'FORBIDDEN',
	FORM_NOT_FOUND: 'FORM_NOT_FOUND',
	INVALID_FORM_DATA: 'INVALID_FORM_DATA',
	SUBMISSION_VALIDATION_ERROR: 'SUBMISSION_VALIDATION_ERROR',
}

module.exports.USE_CASES_ERROR_CODES = USE_CASES_ERROR_CODES;

module.exports.translateInterfaceErrorCodeToHttpStatusCode = function (errorCode) {
	switch (errorCode) {
		case USE_CASES_ERROR_CODES.INVALID_FORM_DATA:
			return 400;
		case USE_CASES_ERROR_CODES.SUBMISSION_VALIDATION_ERROR:
			return 400;
		case USE_CASES_ERROR_CODES.INVALID_TOKEN:
			return 401;
		case USE_CASES_ERROR_CODES.INVALID_CREDENTIALS:
			return 401;
		case USE_CASES_ERROR_CODES.FORBIDDEN:
			return 403;
		case USE_CASES_ERROR_CODES.USER_NOT_FOUND:
			return 404;
		case USE_CASES_ERROR_CODES.FORM_NOT_FOUND:
			return 404;
		case USE_CASES_ERROR_CODES.USER_ALREADY_EXISTS:
			return 409;
		case USE_CASES_ERROR_CODES.INTERNAL:
			return 500;
		default:
			return 500;
	}
}

class UseCaseError extends Error {
	constructor ({ interfaceCode, message, body}) {
		super(message);

		this.name = 'UseCaseError';
		this.interfaceCode = interfaceCode;
		this.body = body;
	}

	getName () {
		return this.name;
	}

	getCode () {
		return this.interfaceCode;
	}

	getBody () {
		return this.body;
	}

	getMessage() {
		return this.message;
	}

	toPlainObject () {
		return {
			success: false,
			interfaceCode: this.interfaceCode,
			message: this.message,
			body: this.body
		}
	}
}

module.exports.UseCaseError = UseCaseError

module.exports.makeUserExistError = function (message) {
	return new UseCaseError({
		message,
		interfaceCode: USE_CASES_ERROR_CODES.USER_ALREADY_EXISTS
	})
}

module.exports.makeInvalidTokenError = function (message) {
	return new UseCaseError({
		message,
		interfaceCode: USE_CASES_ERROR_CODES.INVALID_TOKEN
	})
}

module.exports.makeUserNotFoundError = function (message) {
	return new UseCaseError({
		message,
		interfaceCode: USE_CASES_ERROR_CODES.USER_NOT_FOUND
	})
}

module.exports.makeInvalidCredentialsError = function (message, body=null) {
	return new UseCaseError({
		message,
		interfaceCode: USE_CASES_ERROR_CODES.INVALID_CREDENTIALS,
		...(body ? { body } : {} )
	})
}

module.exports.makeForbiddenError = function (message) {
	return new UseCaseError({
		message,
		interfaceCode: USE_CASES_ERROR_CODES.FORBIDDEN
	})
}

module.exports.makeFormNotFoundError = function (message) {
	return new UseCaseError({
		message,
		interfaceCode: USE_CASES_ERROR_CODES.FORM_NOT_FOUND
	})
}

module.exports.makeInvalidFormDataError = function (message) {
	return new UseCaseError({
		message,
		interfaceCode: USE_CASES_ERROR_CODES.INVALID_FORM_DATA
	})
}

module.exports.makeInternalError = function (message) {
	return new UseCaseError({
		message,
		interfaceCode: USE_CASES_ERROR_CODES.INTERNAL
	})
}

module.exports.makeFormSubmissionValidationError = function (message, body=null) {
	return new UseCaseError({
		message,
		interfaceCode: USE_CASES_ERROR_CODES.SUBMISSION_VALIDATION_ERROR,
		...(body ? { body } : {} )
	})
}