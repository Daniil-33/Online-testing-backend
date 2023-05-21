module.exports = function makeGetUser ({
		userRepository,
		makeUser,

		safeAsyncCall,
		verifyJWT,

		makeUserNotFoundError,
		makeInternalError,
	} = {}) {
		return function getUser ({ userId, token }) {
			return new Promise(async (resolve, reject) => {
				let ID = null

				if (!token) {
					ID = userId
				} else {
					const [decryptedToken, tokenError] = await safeAsyncCall(verifyJWT(token))

					if (tokenError) {
						return reject(makeInternalError(`Error while parsing token.`))
					}

					const { id: userId } = decryptedToken

					ID = userId
				}

				const [candidate, candidateError] = await safeAsyncCall(userRepository.findById({ id: ID }))

				if (candidateError) {
					return reject(makeInternalError(`Error while fetching user.`))
				} else if (!candidate) {
					return reject(makeUserNotFoundError(`User does not exist.`))
				}

				const user = makeUser(candidate)

				return resolve(user.toObject())
			})
		}
};