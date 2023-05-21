module.exports.buildMakeUpdateSubmissionPoints = function ({
	submissionRepository,

	safeAsyncCall,

	makeForm,
	makeSubmission,

	makeInternalError,
	makeForbiddenError,

	getSubmissionUseCase,
	getFormUseCase,
} = {}) {
	return async function({ userId, submissionId, pointsByAnswers }) {
		return new Promise(async (resolve, reject) => {
			const [submissionData, submissionError] = await safeAsyncCall(getSubmissionUseCase({ submissionId, userId }))

			if (submissionError) {
				return reject(submissionError)
			}

			const submission = makeSubmission(submissionData)
			const [formData, formError] = await safeAsyncCall(getFormUseCase({ formId: submission.getFormId(), userId }))

			if (formError) {
				return reject(formError)
			}

			const form = makeForm(formData)

			if (form.getAuthorId() !== userId) {
				return reject(makeForbiddenError(`You are not allowed to access this form.`))
			}

			submission.setPointsByAnswers(pointsByAnswers)

			const [updatedSubmission, updateError] = await safeAsyncCall(submissionRepository.updateById(submission.toObject()))

			if (updateError) {
				return reject(makeInternalError(`Error while updating submission.`))
			}

			return resolve(Object.freeze({
				submission: submission.toObject(),
			}))
		})
	}
}