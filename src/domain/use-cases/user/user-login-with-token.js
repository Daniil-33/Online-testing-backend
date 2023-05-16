module.exports = function makeUserLoginWithToken ({
		userRepository,
		makeUser,
		makeJWTSing,

		verifyJWT,
		safeAsyncCall,
		safeSyncCall,

		makeInvalidTokenError,
		makeInternalError
	}={}) {
		return function userLoginWithToken({ token }) {
			return new Promise(async (resolve, reject) => {
				const [decryptedToken, tokenError] = await safeAsyncCall(verifyJWT(token))


				if (tokenError) {
					return reject(makeInvalidTokenError(`Invalid token.`))
				}

				const { id: userId } = decryptedToken
				const candidate = await userRepository.findById({ id: userId })

				const [user, userError] = safeSyncCall(() => makeUser({ ...candidate }))

				if (userError) {
					return reject(makeInternalError(userError.message))
				}

				const newToken = await makeJWTSing({ id: user.getId() })

				resolve(Object.freeze({
					token: newToken,
					user: {
						id: user.getId(),
						userName: user.getUserName(),
						email: user.getEmail(),
						createdForms: user.getCreatedForms(),
						submissions: user.getSubmissions(),
					}
				}))
			})
		}
}