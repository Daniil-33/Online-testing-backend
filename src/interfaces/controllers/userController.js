module.exports = function makeUserController({
	makeHttpError,
	makeHttpResponse,

	safeAsyncCall,
	translateInterfaceErrorCodeToHttpStatusCode,

	registerUserUseCase,
	loginUserWithCredentialsUseCase,
	loginUserWithTokenUseCase,
}) {
	return function handle(httpRequest) {
		switch (httpRequest.method) {
			case 'POST':
				return registerUser(httpRequest);
			case 'GET':
				return loginUser(httpRequest);
			default:
				return makeHttpError({
					errorData: {
						message:'Method not allowed'
					},
					errorCode: 405,
				});
		}
	}

	async function registerUser(httpRequest) {
		const { ...userInfo } = httpRequest.body;

		if (!userInfo) {
			return makeHttpError({
				errorData: {
					message: 'Bad request. Please provide user information.'
				},
				code: 400,
			});
		}

		const [userData, userRegisterError] = await safeAsyncCall(registerUserUseCase({ userInfo }))

		if (userRegisterError) {
			return makeHttpError({
				errorData: userRegisterError.toPlainObject(),
				code: translateInterfaceErrorCodeToHttpStatusCode(userRegisterError.getCode()),
			});
		}

		return makeHttpResponse(userData)
	}

	async function loginUser(httpRequest) {
		const { authorization: token } = httpRequest.headers;
		const credentials = { email, password } = httpRequest.queryParams;

		if (!token && !email && !password) {
			return makeHttpError({
				errorData: {
					message: 'Bad request. Please provide credentials or token.'
				},
				code: 400,
			});
		}

		let userData, userLoginError;

		if (token) {
			[userData, userLoginError] = await safeAsyncCall(loginUserWithTokenUseCase({ token }))

			if (!userLoginError) {
				return makeHttpResponse(userData)
			} else if (!email && !password) {
				return makeHttpError({
					errorData: userLoginError.toPlainObject(),
					code: translateInterfaceErrorCodeToHttpStatusCode(userLoginError.getCode()),
				});
			}
		}

		if (credentials) {
			[userData, userLoginError] = await safeAsyncCall(loginUserWithCredentialsUseCase({ credentials }))

			console.log('yeah', userData)
			if (!userLoginError) {
				return makeHttpResponse(userData)
			}
		}

		return makeHttpError({
			errorData: userLoginError.toPlainObject(),
			code: translateInterfaceErrorCodeToHttpStatusCode(userLoginError.getCode()),
		});
	}
}