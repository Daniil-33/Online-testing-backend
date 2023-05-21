module.exports.buildMakeGetSubmission = function ({
	submissionRepository,
	makeSubmission,
	makeForm,

	safeAsyncCall,
	safeSyncCall,

	makeInternalError,
	makeForbiddenError,
} = {}) {
	return async function({ submissionId, userId }) {
		return new Promise(async (resolve, reject) => {
			const [submissionData, submissionError] = await safeAsyncCall(submissionRepository.findById({ id: submissionId }))

			if (submissionError) {
				return reject(makeInternalError('Error while fetching submission.'))
			}

			const submission = makeSubmission(submissionData)

			const formId = submission.getFormId()

			const [formData, formError] = await safeAsyncCall(formRepository.findById({ id: formId }))

			if (formError) {
				return reject(makeInternalError('Error while fetching form.'))
			}

			const form = makeForm(formData)

			if (submission.getSubmitterId() !== userId || form.getAuthorId() !== userId) {
				return reject(makeForbiddenError(`You are not allowed to access this submission.`))
			}

			return resolve(submission.toObject())
		})
	}
}