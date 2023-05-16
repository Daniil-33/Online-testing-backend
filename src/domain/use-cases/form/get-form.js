module.exports = function makeGetForm ({
	userRepository,
	formRepository,

	makeUser,
	makeForm,

	safeAsyncCall,
	makeUserNotFoundError,
	makeForbiddenError,
	makeFormNotFoundError,
	makeInternalError,
}={}) {
	return function({ formId, userId }) {
		return new Promise(async (resolve, reject) => {
			const [candidate, candidateError] = await safeAsyncCall(userRepository.findById({ id: userId }))

			if (candidateError) {
				return reject(makeInternalError(`Error while fetching user.`))
			} else if (!candidate) {
				return reject(makeUserNotFoundError(`User does not exist.`))
			}

			const [formData, formError] = await safeAsyncCall(formRepository.findById({ id: formId }))

			if (formError) {
				return reject(makeInternalError(`Error while fetching forms.`))
			} else if (!formData) {
				return reject(makeFormNotFoundError(`Form does not exist.`))
			}

			const user = makeUser(candidate)
			const form = makeForm(formData)

			if (form.getAuthorId() !== user.getId()) {
				return reject(makeForbiddenError(`You are not allowed to access this form.`))
			}

			return resolve(Object.freeze({
				form: {
					id: form.getId(),
					authorId: form.getAuthorId(),
					createdOn: form.getCreatedOn(),
					title: form.getTitle(),
					description: form.getDescription(),
					questions: form.getPlainQuestions(),
					submissions: form.getSubmissions(),
					updatedOn: form.getUpdatedOn(),
					settings: form.getSettings(),
				}
			}))
		})
	}
}