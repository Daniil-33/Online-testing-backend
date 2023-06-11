module.exports = function buildMakeGetSubmission ({
	submissionRepository,
	makeFormSubmission,
	makeForm,

	safeAsyncCall,

	makeInternalError,
	makeForbiddenError,

	getFormsUseCases,
} = {}) {
	return async function({
		submissionId,
		userId,

		fullSubmissionObject = false,
	}) {
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

			if (submission.getSubmitterId() !== userId && form.getAuthorId() !== userId) {
				return reject(makeForbiddenError(`You are not allowed to access this submission.`))
			}

			if (fullSubmissionObject) {
				return resolve(Object.freeze({
					submission: submission.toObject(),
				}))
			}

			const isRequestedByFormAuthor = userId === form.getAuthorId()
			const formattedSubmissionQuestionsAnswers = form
				.getQuestions()
				.map((question) => {
					if (isRequestedByFormAuthor || (form.getShowResultsAfter() === 'check' ? submission.isChecked() : true)) {
						return question.renderQuestionWithAnswer(submission.getAnswer(question.getId()), true)
					}

					return question.renderQuestionWithAnswer(submission.getAnswer(question.getId()), false)
				})

			return resolve(Object.freeze({
				submission: {
					...(isRequestedByFormAuthor || (form.getShowResultsAfter() === 'check' ? submission.isChecked() : true) ? { aggregatedPoints: submission.getAggregatedPoints() } : {}),
					...submission.toMetaDataObject(),
					formData: form.toMetaDataObject(),
					questions: formattedSubmissionQuestionsAnswers
				}
			}))
		})
	}
}