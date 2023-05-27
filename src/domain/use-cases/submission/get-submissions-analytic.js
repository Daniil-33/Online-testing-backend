module.exports = function makeGetSubmissionsAnalytic({
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
	return function getSubmissionsAnalytic({
		formId,
		userId,
	}) {
		return new Promise(async (resolve, reject) => {
			const {
				getFormUseCase,
			} = getFormsUseCases()

			const [formData, formError] = await safeAsyncCall(getFormUseCase({ formId, userId }))

			if (formError) {
				return reject(formError)
			}

			const form = makeForm(formData.form)

			if (form.getAuthorId() !== userId) {
				return reject(makeForbiddenError(`You are not allowed to access this analytic.`))
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
					submitterData: submittersData.find(user => user._id === submission.getSubmitterId()),
				}
			})

			const {
				pointsSummary,
				checkedCount,
				uncheckedCount,
				maxSubmissionPoints,
				minSubmissionPoints,
			} = submissions.reduce(({ pointsSummary, checkedCount, uncheckedCount, maxSubmissionPoints, minSubmissionPoints }, submissionData) => {
				const submission = makeFormSubmission(submissionData)

				if (submission.getAggregatedPoints() > maxSubmissionPoints) {
					maxSubmissionPoints = submission.getAggregatedPoints()
				}

				if (submission.getAggregatedPoints() < minSubmissionPoints) {
					minSubmissionPoints = submission.getAggregatedPoints()
				}

				return {
					pointsSummary: pointsSummary + submission.getAggregatedPoints(),
					checkedCount: checkedCount + (submission.isChecked() ? 1 : 0),
					uncheckedCount: uncheckedCount + (submission.isChecked() ? 0 : 1),
					maxSubmissionPoints,
					minSubmissionPoints,
				}
			}, { pointsSummary: 0, checkedCount: 0, uncheckedCount: 0, maxSubmissionPoints: 0, minSubmissionPoints: form.getMaxPoints() })

			return resolve(Object.freeze({
				analytic: {
					submissions: formattedSubmissions,
					maxFormPoints: form.getMaxPoints(),
					averagePoints: (pointsSummary / formattedSubmissions.length).toFixed(2),
					checkedCount,
					uncheckedCount,
					maxSubmissionPoints,
					minSubmissionPoints,
				},
			}))
		})
	}
}