module.exports = function buildMakeUpdateSubmissionPoints ({
	submissionRepository,

	safeAsyncCall,

	makeForm,
	makeFormSubmission,

	makeInternalError,
	makeForbiddenError,

	getSubmissionUseCase,
	getFormsUseCases,
} = {}) {
	return async function({ userId, submissionId, pointsData }) {
		const { getFormUseCase } = getFormsUseCases()

		return new Promise(async (resolve, reject) => {
			const [submissionData, submissionError] = await safeAsyncCall(getSubmissionUseCase({ submissionId, userId, fullSubmissionObject: true }))

			if (submissionError) {
				return reject(submissionError)
			}

			const submission = makeFormSubmission(submissionData.submission)
			const [formData, formError] = await safeAsyncCall(getFormUseCase({ formId: submission.getFormId(), userId }))

			if (formError) {
				return reject(formError)
			}

			const form = makeForm(formData.form)

			if (form.getAuthorId() !== userId) {
				return reject(makeForbiddenError(`You are not allowed to access this form.`))
			}

			submission.setPointsByAnswers(pointsData)

			const [updatedSubmission, updateError] = await safeAsyncCall(submissionRepository.updateById({ id: submissionId, ...submission.toObject() }))

			if (updateError) {
				return reject(makeInternalError(`Error while updating submission.`))
			}

			return resolve(Object.freeze({
				submission: submission.toObject(),
			}))
		})
	}
}