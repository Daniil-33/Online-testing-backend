module.exports = function makeUpdateUser ({
	userRepository,
	makeUser,

	safeAsyncCall,
	safeSyncCall,
	dataValidator,

	makeInternalError,
	makeInvalidCredentialsError,
}) {
	return async function updateUser ({ userData }) {
		return new Promise(async (resolve, reject) => {
			dataValidator
				.setData(userData)
				.validate('_id').notEmpty().toBeString()

			if (dataValidator.hasErrors()) {
				return reject(makeInvalidCredentialsError('Invalid credentials', dataValidator.getErrors()))
			}

			const [user, userError] = safeSyncCall(() => makeUser(userData))

			if (userError) {
				reject(makeInternalError(userError.message))
			}

			const [updateResult, updateError] = await safeAsyncCall(userRepository.updateById(user.toObject()))

			if (updateError) {
				return reject(makeInternalError(`Error while updating user.`))
			}

			resolve(true)
		})
	}
}