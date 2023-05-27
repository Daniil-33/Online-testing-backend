module.exports = function makeGetFormsList ({
		formRepository,
		safeAsyncCall,
		makeInternalError,

		makeForm,
	}={}) {
		return function getFormsList ({ userId, formIds }) {
			return new Promise(async (resolve, reject) => {
				let forms = []
				let formsError = null


				if (userId) {
					[forms, formsError] = await safeAsyncCall(formRepository.findByAuthorId({
						authorId: userId,
					}))
				} else if (formIds && formIds.length) {
					[forms, formsError] = await safeAsyncCall(formRepository.findByIds({
						formIds,
					}))
				}

				if (formsError) {
					return reject(makeInternalError(`Error while fetching forms.`))
				}

				return resolve(Object.freeze({
					forms: forms.map(form => makeForm(form).toMetaDataObject())
				}))
			})
		}
}