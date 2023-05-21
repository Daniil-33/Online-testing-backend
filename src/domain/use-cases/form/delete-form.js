module.exports = function makeGetForm ({
	formRepository,

	makeUser,
	makeForm,

	safeAsyncCall,
	makeForbiddenError,
	makeInternalError,

	getUserUseCase,
	getFormUseCase,
}={}) {
	return function deleteForm ({ formId, userId }) {
		return new Promise(async (resolve, reject) => {
			const [formData, formError] = await safeAsyncCall(getFormUseCase({ formId }))

			if (formError) {
				return reject(formError)
			}

			const form = makeForm(formData)

			if (form.getAuthorId() !== userId) {
				return reject(makeForbiddenError(`You are not allowed to delete this form.`))
			}

			const [deleteResult, deleteError] = await safeAsyncCall(formRepository.deleteById({ id: form.getId() }))

			if (deleteError) {
				return reject(makeInternalError(`An error occurred while deleting the form.`))
			}

			return resolve(true)
		})
	}
}