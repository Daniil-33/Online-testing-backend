module.exports = function buildMakeGetSubmission ({
	submissionRepository,
	makeFormSubmission,
	makeForm,

	safeAsyncCall,

	makeInternalError,
	makeForbiddenError,

	getFormsUseCases,
} = {}) {
	return async function({ submissionId, userId }) {
		return new Promise(async (resolve, reject) => {
			const { getFormUseCase } = getFormsUseCases()

			const [submissionData, submissionError] = await safeAsyncCall(submissionRepository.findById({ id: submissionId }))

			if (submissionError) {
				return reject(makeInternalError('Error while fetching submission.'))
			}

			const submission = makeFormSubmission(submissionData)
			const formId = submission.getFormId()
			const [formData, formError] = await safeAsyncCall(getFormUseCase({ formId, userId, ignoreAuthorId: true }))

			if (formError) {
				return reject(makeInternalError('Error while fetching form.'))
			}

			const form = makeForm(formData.form)

			if (submission.getSubmitterId() !== userId || form.getAuthorId() !== userId) {
				return reject(makeForbiddenError(`You are not allowed to access this submission.`))
			}

			const formattedSubmissionQuestionsAnswers = form
				.getQuestions()
				.map((question) => {
					if (form.isTest() && !submission.isChecked()) {
						return question.renderQuestionWithAnswer(submission.getAnswer(question.getId()), true)
					}

					return question.renderQuestionWithAnswer(submission.getAnswer(question.getId()), false)
				})

			return resolve(Object.freeze({
				submission: {
					id: submission.getId(),
					formId: submission.getFormId(),
					submitterId: submission.getSubmitterId(),

					submissionData: submission.toMetaDataObject(),
					formData: form.toMetaDataObject(),

					questions: formattedSubmissionQuestionsAnswers
				}
			}))
		})
	}
}