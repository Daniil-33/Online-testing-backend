module.exports = function makeGetFormsList ({
		formRepository,
		safeAsyncCall,
		makeInternalError,

		makeForm,
	}={}) {
		return function getFormsList ({ userId, formIds }) {
			return new Promise(async (resolve, reject) => {
				if (userId) {
					const [forms, formsError] = await safeAsyncCall(formRepository.findByAuthorId({
						authorId: userId,
						attrs: { createdOn: 1, title: 1, description: 1 }
					}))

					if (formsError) {
						return reject(makeInternalError(`Error while fetching forms.`))
					}

					return resolve(Object.freeze({
						forms
					}))
				} else if (formIds && formIds.length) {
					const [forms, formsError] = await safeAsyncCall(formRepository.findByIds({
						formIds,
					}))

					if (formsError) {
						return reject(makeInternalError(`Error while fetching forms.`))
					}

					return resolve(Object.freeze({
						forms: forms.map(form => makeForm(form).toMetaDataObject())
					}))
				}
			})
		}
}