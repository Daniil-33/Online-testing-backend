module.exports = function makeGetFormsList ({
		userRepository,
		formRepository,

		makeUser,

		safeAsyncCall,

		makeUserNotFoundError,
		makeInternalError,
	}={}) {
		return function({ userId }) {
			return new Promise(async (resolve, reject) => {
				const [candidate, candidateError] = await safeAsyncCall(userRepository.findById({ id: userId }))

				if (candidateError) {
					return reject(makeInternalError(`Error while fetching user.`))
				} else if (!candidate) {
					return reject(makeUserNotFoundError(`User does not exist.`))
				}

				const user = makeUser(candidate)

				const [forms, formsError] = await safeAsyncCall(formRepository.findByAuthorId({
					authorId: user.getId(),
					attrs: { createdOn: 1, title: 1, description: 1 }
				}))

				if (formsError) {
					return reject(makeInternalError(`Error while fetching forms.`))
				}

				// console.log('RESOLVE', forms)
				return resolve(Object.freeze({
					forms
				}))
			})
		}
}