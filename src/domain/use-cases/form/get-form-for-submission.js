module.exports = function makeGetForm ({
	formRepository,

	makeUser,
	makeForm,

	safeAsyncCall,

	makeForbiddenError,
	makeFormNotFoundError,
	makeInternalError,
	makeFormNotAcceptingSubmissionsError,
	makeFormAlreadySubmittedError,

	getUserUseCase,
}={}) {
	return function getFormForSubmission({ formId, userId }) {
		return new Promise(async (resolve, reject) => {
			const [userData, userError] = await safeAsyncCall(getUserUseCase({ userId }))

			if (userError) {
				return reject(userError)
			}

			const user = makeUser(userData)
			const [formData, formError] = await safeAsyncCall(formRepository.findById({ id: formId }))

			if (formError) {
				return reject(makeInternalError(`Error while fetching forms.`))
			} else if (!formData) {
				return reject(makeFormNotFoundError(`Form does not exist.`))
			}

			const form = makeForm(formData)

			if (!form.isAcceptingSubmissions()) {
				return reject(makeFormNotAcceptingSubmissionsError(`Form is not accepting submissions.`))
			}

			const userSubmissions = user.getSubmissions()
			const isFormHasSubmissionFromUser = form.getSubmissions().some(submissionId => userSubmissions.includes(submissionId))

			if (isFormHasSubmissionFromUser && form.isSubmitOnce()) {
				return reject(makeFormAlreadySubmittedError(`You are not allowed to submit this form more than once.`))
			}

			return resolve(Object.freeze({
				form: form.toSubmissionFormat(),
			}))
		})
	}
}