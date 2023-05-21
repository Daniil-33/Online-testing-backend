module.exports = function makePostForm ({
	formRepository,

	makeForm,

	safeAsyncCall,

	makeFormNotFoundError,
	makeInternalError,
	makeInvalidFormDataError,

	addSubmissionUseCase,

	dataValidator,
}={}) {
	return function postForm({ formData, userId }) {
		return new Promise(async (resolve, reject) => {
			dataValidator
				.setData(formData)
				.validate('formId').notEmpty()
				.validate('answers').notEmpty().toBeObject()

			if (dataValidator.hasErrors()) {
				return reject(makeInvalidFormDataError('Invalid form data', dataValidator.getErrors()))
			}

			const { formId, answers } = formData
			const [formInfo, formError] = await safeAsyncCall(formRepository.findById({ id: formId }))

			if (formError) {
				return reject(makeInternalError(`Error while fetching form.`))
			} else if (!formInfo) {
				return reject(makeFormNotFoundError(`Form not found.`))
			}

			const form = makeForm(formInfo)

			const [submission, submissionError] = await safeAsyncCall(() => addSubmissionUseCase({
				form,
				userId,
				answers,
			}))

			if (submissionError) {
				return reject(submissionError)
			}

			resolve({
				confirmText: form.getConfirmText()
			})
		})
	}
}