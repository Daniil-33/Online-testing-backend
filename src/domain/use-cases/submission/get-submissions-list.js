module.exports = function makeGetSubmissionsList({
		submissionRepository,

		safeAsyncCall,
		uniqArrayItems,

		makeForm,
		makeFormSubmission,

		makeInternalError,
		makeForbiddenError,

		getFormsUseCases,
		getUserUseCase,
	}={}) {
		return function getSubmissionsList({
			formId,
			userId,
		}) {
			return new Promise(async (resolve, reject) => {
				const {
					getFormUseCase,
					getFormsListUseCase,
				} = getFormsUseCases()

				if (formId) {
					const [formData, formError] = await safeAsyncCall(getFormUseCase({ formId, userId }))

					if (formError) {
						return reject(formError)
					}

					const form = makeForm(formData.form)

					if (form.getAuthorId() !== userId) {
						return reject(makeForbiddenError(`You are not allowed to access this form.`))
					}

					const [submissions, submissionsError] = await safeAsyncCall(submissionRepository.findByFormId({ formId }))

					if (submissionsError) {
						return reject(makeInternalError(`Error while fetching submissions.`))
					}

					const usersIds = uniqArrayItems(submissions.map(submission => makeFormSubmission(submission).getSubmitterId()))
					const [submittersData, submittersError] = await safeAsyncCall(getUserUseCase({ usersIds }))

					if (submittersError) {
						return reject(submittersError)
					}

					const formattedSubmissions = submissions.map(submissionData => {
						const submission = makeFormSubmission(submissionData)

						return {
							...submission.toMetaDataObject(),
							maxFormPoints: form.getMaxPoints(),
							submitterData: submittersData.find(user => user._id === submission.getSubmitterId()),
						}
					})

					return resolve(Object.freeze({
						submissions: formattedSubmissions,
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
					const extendedSubmissions = submissions.map(submissionData => {
						const submission = makeFormSubmission(submissionData)
						const formId = submission.getFormId()
						const formData = formsMetaDataById[formId] || null

						return {
							...submission.toMetaDataObject(),
							formData,
						}
					})

					return resolve(Object.freeze({
						submissions: extendedSubmissions
					}))
				}
			})
		}
	}