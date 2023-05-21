module.exports = function makeGetFormsList ({
		formRepository,
		safeAsyncCall,
		makeInternalError,
	}={}) {
		return function getFormList ({ userId }) {
			return new Promise(async (resolve, reject) => {
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
			})
		}
}