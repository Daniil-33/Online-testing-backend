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

			if (!form.isAcceptingSubmissions()) {
				// TODO: Add a new error type for this.
				return reject(makeForbiddenError(`Form is not accepting submissions.`))
			}

			const userSubmissions = user.getSubmissions()
			const isFormHasSubmissionFromUser = form.getSubmissions().some(submissionId => userSubmissions.includes(submissionId))

			if (isFormHasSubmissionFromUser && form.isSubmitOnce()) {
				// TODO: Add a new error type for this.
				return reject(makeForbiddenError(`You are not allowed to submit this form more than once.`))
			}

			return resolve(Object.freeze({
				form: form.toSubmissionFormat(),
			}))
		})
	}
}