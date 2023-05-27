module.exports = function buildMakeAddSubmission ({
		submissionRepository,
		userRepository,
		formRepository,

		makeUser,
		makeFormSubmission,

		safeAsyncCall,
		safeSyncCall,

		makeInternalError,
		makeFormSubmissionValidationError,

		getUserUseCase,
		getFormsUseCases,
	} = {}) {
		// This use case awaiting for already created user and form entities objects as it calls only from another use case (post-form.js)
		// in future there should be added check ups by userId and formId (for example, in case of import data)
		return async function addSubmission({ answers, userId, form }) {
			const { updateFormUseCase } = getFormsUseCases()

			return new Promise(async (resolve, reject) => {
				const [userData, userError] = await safeAsyncCall(getUserUseCase({ userId }))

				if (userError) {
					return reject(userError)
				}

				const user = makeUser(userData)

				const [submission, submissionError] = safeSyncCall(() => makeFormSubmission({
					submitterId: user.getId(),
					answers,
					form,
				}))

				if (submissionError) {
					return reject(makeInternalError(submissionError))
				}

				const emptyAnswersForRequiredQuestions = submission.getEmptyAnswers()

				if (emptyAnswersForRequiredQuestions.length && !(form.getQuestionDefaultTimeLimit() || form.getGeneralTimeLimit())) {
					return reject(makeFormSubmissionValidationError(`Please answer all required questions.`, emptyAnswersForRequiredQuestions))
				}

				submission.checkUp()

				const [insertionResult, insertionError] = await safeAsyncCall(submissionRepository.insert({
					_id: submission.getId(),
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

				user.addSubmission(submission.getId())

				const [updateResult, updateError] = await safeAsyncCall(userRepository.updateById({
					id: user.getId(),
					createdForms: user.getCreatedForms()
				}))

				if (updateError) {
					return reject(makeInternalError(`Error while updating user.`))
				}

				form.addSubmission(submission.getId())

				// const [updateFormResult, updateFormError] = await safeAsyncCall(formRepository.updateById({
				// 	id: form.getId(),
				// 	submissions: form.getSubmissions()
				// }))
				const [updateFormResult, updateFormError] = await safeAsyncCall(updateFormUseCase({
					formId: form.getId(),
					formData: form.toObject(),
					userId
				}))

				if (updateFormError) {
					return reject(makeInternalError(`Error while updating form.`))
				}

				return resolve(submission)
			})
		}
}