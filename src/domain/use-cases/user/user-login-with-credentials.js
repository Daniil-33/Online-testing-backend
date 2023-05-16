module.exports = function makeUserLoginWithCredentials ({
		userRepository,
		makeUser,
		makeJWTSing,
		comparePasswords,

		dataValidator,
		safeSyncCall,

		makeUserNotFoundError,
		makeInvalidCredentialsError,
		makeInternalError,
	}={}) {
		return function userLoginWithCredentials({ credentials }) {
			return new Promise(async (resolve, reject) => {
				dataValidator
					.setData(credentials)
					.validate('email').notEmpty().isEmail()
					.validate('password').notEmpty()

				if (dataValidator.hasErrors()) {
					return reject(makeInvalidCredentialsError('Invalid credentials', dataValidator.getErrors()))
				}

				const candidate = await userRepository.findByEmail({ email })

				if (!candidate) {
					reject(makeUserNotFoundError(`User with this email does not exist`))
				}

				const [user, userError] = safeSyncCall(() => makeUser(candidate))

				if (userError) {
					reject(makeInternalError(userError.message))
				}

				const isPasswordValid = await comparePasswords(password, user.getPassword())

				if (!isPasswordValid) {
					reject(makeInvalidCredentialsError(`Invalid password`))
				}

				const token = makeJWTSing({ id: user.getId() })

				resolve(Object.freeze({
					token,
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