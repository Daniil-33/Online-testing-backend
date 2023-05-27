module.exports = function makeAddForm ({
		formRepository,
		userRepository,

		makeForm,
		makeUser,

		safeAsyncCall,
		safeSyncCall,
		dataValidator,

		makeInternalError,
		makeInvalidFormDataError,

		getUserUseCase,
		updateUserUseCase,
	}={}) {
		return function addForm({ formData, userId }) {
			return new Promise(async (resolve, reject) => {
				dataValidator
					.setData(formData)
					.validate('title').notEmpty().toBeString()
					.validate('description').toBeString()
					.validate('questions').toBeArray()
					.validate('settings').toBeObject()

				if (dataValidator.hasErrors()) {
					return reject(makeInvalidFormDataError('Invalid form data', dataValidator.getErrors()))
				}

				const [userData, userError] = await safeAsyncCall(getUserUseCase({ userId }))

				if (userError) {
					return reject(userError)
				}

				const user = makeUser(userData)
				const [form, formError] = safeSyncCall(() => makeForm({
					...formData,
					authorId: user.getId()
				}))

				if (formError) {
					return reject(makeInternalError(formError.message))
				}

				const [insertedId, insertionError] = await safeAsyncCall(formRepository.insert({
					...form.toObject()
				}))

				if (insertionError) {
					return reject(makeInternalError(`Error while inserting form.`))
				}

				user.addCreatedForm(form.getId())

				const [updateResult, updateError] = await safeAsyncCall(updateUserUseCase({ userData: user.toObject() }))

				if (updateError) {
					return reject(updateError)
				}

				resolve({
					formId: insertedId
				})
			})
		}
}