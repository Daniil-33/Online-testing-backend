module.exports = function makeGetForm ({
	formRepository,

	makeUser,
	makeForm,

	safeAsyncCall,
	makeForbiddenError,
	makeInternalError,

	getUserUseCase,
	getFormUseCase,
	updateUserUseCase,
}={}) {
	return function deleteForm ({ formId, userId }) {
		return new Promise(async (resolve, reject) => {
			const [formData, formError] = await safeAsyncCall(getFormUseCase({ formId, userId }))

			if (formError) {
				return reject(formError)
			}

			const form = makeForm(formData.form)

			if (form.getAuthorId() !== userId) {
				return reject(makeForbiddenError(`You are not allowed to delete this form.`))
			}

			const [deleteResult, deleteError] = await safeAsyncCall(formRepository.deleteById({ id: form.getId() }))

			if (deleteError) {
				return reject(makeInternalError(`An error occurred while deleting the form.`))
			}

			const [userData, userError] = await safeAsyncCall(getUserUseCase({ userId }))

			if (userError) {
				return reject(userError)
			}

			const user = makeUser(userData)

			user.removeCreatedForm(formId)

			const [updateResult, updateError] = await safeAsyncCall(updateUserUseCase({ userId, userData: user.toObject() }))

			if (updateError) {
				return reject(updateError)
			}

			return resolve(true)
		})
	}
}