module.exports = function makeGetForm ({
	formRepository,

	makeForm,

	safeAsyncCall,
	makeForbiddenError,
	makeFormNotFoundError,
	makeInternalError,
}={}) {
	return function getForm ({ formId, userId, ignoreAuthorId}) {
		return new Promise(async (resolve, reject) => {
			const [formData, formError] = await safeAsyncCall(formRepository.findById({ id: formId }))

			if (formError) {
				return reject(makeInternalError(`Error while fetching forms.`))
			} else if (!formData) {
				return reject(makeFormNotFoundError(`Form does not exist.`))
			}

			const form = makeForm(formData)

			if (form.getAuthorId() !== userId && !ignoreAuthorId) {
				return reject(makeForbiddenError(`You are not allowed to access this form.`))
			}

			return resolve(Object.freeze({
				form: form.toObject(),
			}))
		})
	}
}