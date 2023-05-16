module.exports = function makePostForm ({
	formRepository,
	userRepository,
	submissionRepository,

	makeForm,
	makeUser,
	makeFormSubmission,

	safeAsyncCall,
	safeSyncCall,

	makeUserNotFoundError,
	makeFormNotFoundError,
	makeInternalError,
	makeFormSubmissionValidationError,
	makeInvalidFormDataError,

	dataValidator,
}={}) {
	return function({ formData, userId }) {
		return new Promise(async (resolve, reject) => {
			dataValidator
				.setData(formData)
				.validate('formId').notEmpty()
				.validate('answers').notEmpty().toBeObject()

			if (dataValidator.hasErrors()) {
				return reject(makeInvalidFormDataError('Invalid form data', dataValidator.getErrors()))
			}

			const [candidate, candidateError] = await safeAsyncCall(userRepository.findById({ id: userId }))

			if (candidateError) {
				return reject(makeInternalError(`Error while fetching user.`))
			} else if (!candidate) {
				return reject(makeUserNotFoundError(`User not found.`))
			}

			const user = makeUser(candidate)

			const { formId, answers } = formData
			const [formInfo, formError] = await safeAsyncCall(formRepository.findById({ id: formId }))

			if (formError) {
				return reject(makeInternalError(`Error while fetching form.`))
			} else if (!formInfo) {
				return reject(makeFormNotFoundError(`Form not found.`))
			}

			const form = makeForm(formInfo)

			const [submission, submissionError] = safeSyncCall(() => makeFormSubmission({
				submitterId: user.getId(),
				answers,
				form,
			}))

			if (submissionError) {
				console.log('DEBUG', submissionError)
			}

			const emptyAnswersForRequiredQuestions = submission.getEmptyAnswers()

			if (emptyAnswersForRequiredQuestions.length) {
				return reject(makeFormSubmissionValidationError(`Please answer all required questions.`, emptyAnswersForRequiredQuestions))
			}

			submission.checkUp()

			const [insertionResult, insertionError] = await safeAsyncCall(submissionRepository.insert({
				submitterId: submission.getSubmitterId(),
				formId: submission.getFormId(),
				answers: submission.getAnswers(),
				createdOn: submission.getCreatedOn(),
				isChecked: submission.isChecked(),
				points: submission.getPoints(),
			}))

			if (insertionError) {
				return reject(makeInternalError(`Error while inserting submission.`))
			}

			user.pushSubmission(submission.getId())

			const [updateResult, updateError] = await safeAsyncCall(userRepository.updateById({
				id: user.getId(),
				createdForms: user.getCreatedForms()
			}))

			if (updateError) {
				return reject(makeInternalError(`Error while updating user.`))
			}

			form.pushSubmission(submission.getId())

			const [updateFormResult, updateFormError] = await safeAsyncCall(formRepository.updateById({
				id: form.getId(),
				submissions: form.getSubmissions()
			}))

			if (updateFormError) {
				return reject(makeInternalError(`Error while updating form.`))
			}

			resolve({
				confirmText: form.getConfirmText()
			})
		})
	}
}