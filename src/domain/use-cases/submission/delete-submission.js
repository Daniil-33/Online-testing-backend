module.exports = function buildMakeDeleteSubmission ({
	submissionRepository,

	safeAsyncCall,

	makeForm,
	makeFormSubmission,
	makeUser,

	makeInternalError,
	makeForbiddenError,

	getSubmissionUseCase,
	getUserUseCase,
	updateUserUseCase,
	getFormsUseCases,
} = {}) {
	return async function({ userId, submissionId }) {
		const { getFormUseCase, updateFormUseCase } = getFormsUseCases()

		return new Promise(async (resolve, reject) => {
			const [userData, userError] = await safeAsyncCall(getUserUseCase({ userId }))

			if (userError) {
				return reject(userError)
			}

			const user = makeUser(userData)
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

			if (submission.getSubmitterId() !== userId || form.getAuthorId() !== userId) {
				return reject(makeForbiddenError(`You are not allowed to access this submission.`))
			}

			const [deleteResult, deleteError] = await safeAsyncCall(submissionRepository.deleteById({ id: submissionId }))

			if (deleteError) {
				return reject(makeInternalError(`Error while deleting submission.`))
			}

			user.removeSubmission(submissionId)
			form.removeSubmission(submissionId)

			const [updatedUser, updateUserError] = await safeAsyncCall(updateUserUseCase({ userData: user.toObject() }))

			if (updateUserError) {
				return reject(updateUserError)
			}

			const [updatedForm, updateFormError] = await safeAsyncCall(updateFormUseCase({
				userId,
				formId: form.getId(),
				formData: form.toObject()
			}))

			if (updateFormError) {
				return reject(updateFormError)
			}

			return resolve(true)
		})
	}
}