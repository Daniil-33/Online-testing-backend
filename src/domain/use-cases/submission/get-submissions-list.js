module.exports = function makeGetSubmissionsList({
		submissionRepository,
		formRepository,

		safeAsyncCall,

		makeForm,

		makeInternalError,
		makeFormNotFoundError,
		makeForbiddenError,
	}={}) {
		return function({ formId, userId }) {
			return new Promise(async (resolve, reject) => {
				const [formData, formError] = safeAsyncCall(formRepository.findById({ id: formId }))

				if (formError) {
					return reject(makeInternalError(`Error while fetching forms.`))
				} else if (!formData) {
					return reject(makeFormNotFoundError(`Form does not exist.`))
				}

				const form = makeForm(formData)

				if (form.getAuthorId() !== userId) {
					return reject(makeForbiddenError(`You are not allowed to access this form.`))
				}

				const [submissions, submissionsError] = safeAsyncCall(submissionRepository.findByFormId({ formId }))

				if (submissionsError) {
					return reject(makeInternalError(`Error while fetching submissions.`))
				}

				return resolve(Object.freeze({
					submissions
				}))
			})
		}
	}