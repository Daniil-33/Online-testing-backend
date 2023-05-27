module.exports = function makeGetUser ({
		userRepository,
		makeUser,

		safeAsyncCall,
		verifyJWT,

		makeUserNotFoundError,
		makeInternalError,
	} = {}) {
		return function getUser ({ userId, token, usersIds }) {
			return new Promise(async (resolve, reject) => {
				if (usersIds) {
					const [users, usersError] = await safeAsyncCall(userRepository.findByIds({ ids: usersIds }))

					if (usersError) {
						return reject(makeInternalError(`Error while fetching users.`))
					}

					const formattedUsers = users.map((user) => makeUser(user).toMetaDataObject())

					return resolve(formattedUsers)
				} else {
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
				}
			})
		}
};