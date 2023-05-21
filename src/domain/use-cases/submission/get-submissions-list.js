module.exports = function makeGetSubmissionsList({
		submissionRepository,

		safeAsyncCall,
		uniqArrayItems,

		makeForm,
		makeFormSubmission,

		makeInternalError,
		makeForbiddenError,

		getFormsUseCases
	}={}) {
		return function getSubmissionsList({ formId, userId }) {
			return new Promise(async (resolve, reject) => {
				const {
					getFormUseCase,
					getFormsListUseCase,
				} = getFormsUseCases()

				if (formId) {

					const [formData, formError] = safeAsyncCall(getFormUseCase({ formId, userId }))

					if (formError) {
						return reject(formError)
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
				} else {
					const [submissions, submissionsError] = await safeAsyncCall(submissionRepository.findBySubmitterId({ submitterId: userId }))

					if (submissionsError) {
						return reject(makeInternalError(`Error while fetching submissions.`))
					}

					const formIds = uniqArrayItems(submissions.map(submission => makeFormSubmission(submission).getFormId()))
					const [formsData, formsError] = await safeAsyncCall(getFormsListUseCase({ formIds }))

					if (formsError) {
						return reject(formsError)
					}

					const { forms: formsMetaData } = formsData
					const formsMetaDataById = Object.fromEntries(formsMetaData.map(form => [form._id, form]))
					const extendedSubmissions = submissions.map(submission => {
						const formId = makeFormSubmission(submission).getFormId()
						const formMetaData = formsMetaDataById[formId]

						return {
							...submission,
							formMetaData,
						}
					})

					return resolve(Object.freeze({
						submissions: extendedSubmissions
					}))
				}
			})
		}
	}