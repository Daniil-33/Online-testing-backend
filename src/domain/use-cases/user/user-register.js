module.exports = function makeUserRegister ({
		userRepository,
		makeUser,
		makeJWTSing,
		hashPassword,

		safeAsyncCall,
		safeSyncCall,
		makeUserExistError,
		makeInvalidCredentialsError,
		makeInternalError,
		dataValidator
	}={}) {
		return function userRegister({ userInfo }) {
			return new Promise(async (resolve, reject) => {
				dataValidator
					.setData(userInfo)
					.validate('email').notEmpty().isEmail()
					.validate('password').notEmpty().minLength(6)

				if (dataValidator.hasErrors()) {
					return reject(makeInvalidCredentialsError('Invalid credentials', dataValidator.getErrors()))
				}

				const candidate = await userRepository.findByEmail({ email: userInfo.email })

				if (candidate) {
					return reject(makeUserExistError('User with this email already exists.'))
				}

				const hashedPassword = await hashPassword(userInfo.password)
				const [user, userError] = safeSyncCall(() => makeUser({
					...userInfo,
					password: hashedPassword
				}))


				const [result, insertionError] = await safeAsyncCall(userRepository.insert({
					id: user.getId(),
					userName: user.getUserName(),
					email: user.getEmail(),
					password: user.getPassword(),
					createdOn: user.getCreatedOn(),
					createdForms: user.getCreatedForms(),
					submissions: user.getSubmissions(),
				}))

				if (insertionError) {
					return reject(makeInternalError('Internal DB error'))
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