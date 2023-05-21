module.exports = function makeUpdateForm ({
	formRepository,
	userRepository,

	makeForm,
	makeUser,

	safeAsyncCall,
	safeSyncCall,

	makeUserNotFoundError,
	makeForbiddenError,
	makeInternalError,

	dataValidator,
}={}) {
	return function updateForm ({ formData: newFormData, userId, formId }) {
		return new Promise(async (resolve, reject) => {
			dataValidator
				.setData(newFormData)
				.validate('title').notEmpty().toBeString()
				.validate('description').toBeString()
				.validate('questions').toBeArray()
				.validate('settings').toBeObject()

			if (dataValidator.hasErrors()) {
				return reject(makeInvalidFormDataError('Invalid form data', dataValidator.getErrors()))
			}

			const [formData, formDataError] = await safeAsyncCall(formRepository.findById({ id: formId }))

			if (formDataError) {
				return reject(makeInternalError(`Error while fetching form.`))
			} else if (!formData) {
				return reject(makeInternalError(`Form not found.`))
			}

			const oldForm = makeForm(formData)

			if (oldForm.getAuthorId() !== userId) {
				return reject(makeForbiddenError(`You are not allowed to access this form.`))
			}

			const [newForm, formError] = safeSyncCall(() => makeForm({
				...newFormData,
				authorId: oldForm.getAuthorId(),
				_id: oldForm.getId(),
			}))

			if (formError) {
				return reject(makeInternalError(formError.message))
			}

			const [formUpdateResult, updateError] = await safeAsyncCall(formRepository.updateById({
				id: newForm.getId(),

				authorId: newForm.getAuthorId(),
				createdOn: newForm.getCreatedOn(),
				updatedOn: newForm.getUpdatedOn(),
				title: newForm.getTitle(),
				description: newForm.getDescription(),
				questions: newForm.getPlainQuestions (),
				submissions: newForm.getSubmissions(),
				settings: newForm.getSettings(),
			}))

			if (updateError) {
				return reject(makeInternalError(`Error while updating form.`))
			}

			resolve({
				form: formUpdateResult
			})
		})
	}
}