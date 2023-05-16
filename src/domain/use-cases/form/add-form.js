module.exports = function makeAddForm ({
		formRepository,
		userRepository,

		makeForm,
		makeUser,

		safeAsyncCall,
		safeSyncCall,

		makeUserNotFoundError,
		makeInternalError,
		makeInvalidFormDataError,

		dataValidator,
	}={}) {
		return function({ formData, userId }) {
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

				const [candidate, candidateError] = await safeAsyncCall(userRepository.findById({ id: userId }))

				if (candidateError) {
					return reject(makeInternalError(`Error while fetching user.`))
				} else if (!candidate) {
					return reject(makeUserNotFoundError(`User not found.`))
				}

				const [user, userError] = makeUser(candidate)

				if (userError) {
					return reject(makeInternalError(userError.message))
				}

				const [form, formError] = safeSyncCall(() => makeForm({
					...formData,
					authorId: user.getId()
				}))

				if (formError) {
					return reject(makeInternalError(formError.message))
				}

				const [insertedId, insertionError] = await safeAsyncCall(formRepository.insert({
					_id: form.getId(),
					authorId: form.getAuthorId(),
					createdOn: form.getCreatedOn(),
					updatedOn: form.getUpdatedOn(),
					title: form.getTitle(),
					description: form.getDescription(),
					questions: form.getPlainQuestions(),
					submissions: form.getSubmissions(),

					settings: form.getSettings(),
				}))

				if (insertionError) {
					return reject(makeInternalError(`Error while inserting form.`))
				}

				user.pushCreatedForm(form.getId())

				const [updateResult, updateError] = await safeAsyncCall(userRepository.updateById({
					id: user.getId(),
					createdForms: user.getCreatedForms()
				}))

				if (updateError) {
					return reject(makeInternalError(`Error while updating user.`))
				}

				resolve({
					formId: insertedId
				})
			})
		}
}