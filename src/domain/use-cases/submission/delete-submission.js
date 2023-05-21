module.exports.buildMakeDeleteSubmission = function ({
	submissionRepository,

	safeAsyncCall,

	makeForm,
	makeSubmission,

	makeInternalError,
	makeForbiddenError,

	getSubmissionUseCase,
	getFormUseCase,
} = {}) {
	return async function({ userId, submissionId }) {
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

			if (submission.getSubmitterId() !== userId || form.getAuthorId() !== userId) {
				return reject(makeForbiddenError(`You are not allowed to access this submission.`))
			}

			const [deleteResult, deleteError] = await safeAsyncCall(submissionRepository.deleteById({ id: submissionId }))

			if (deleteError) {
				return reject(makeInternalError(`Error while deleting submission.`))
			}

			return resolve(true)
		})
	}
}