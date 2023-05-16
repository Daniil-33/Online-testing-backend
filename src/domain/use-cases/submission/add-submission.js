module.exports.buildMakeAddSubmission = function ({
		submissionRepository,
		userRepository,
		formRepository,
		makeUser,
		makeForm,
		makeSubmission,

		safeAsyncCall,
		makeUserNotFoundError,
		makeFormNotFoundError,
		makeSubmissionAlreadyExistError,
		makeFormNotAcceptingSubmissionsError,
	} = {}) {
		return async function addSubmission({ submissionData }) {
			return new Promise(async (resolve, reject) => {
				const submission = makeSubmission(submissionData)

				const [candidate, candidateError] = await safeAsyncCall(userRepository.findById({ id: submission.getSubmitterId() }))
				const [formData, formDataError] = await safeAsyncCall(formRepository.findById({ id: submission.getFormId() }))

				if (!candidate) {
					reject(makeUserNotFoundError(`User with id ${ submission.getSubmitterId() } does not exist.`))
				}

				if (!formData) {
					reject(makeFormNotFoundError(`Form with id ${ submission.getFormId() } does not exist.`))
				}

				const user = makeUser(candidate)
				const form = makeForm(formData)

				if (!form.isAcceptingSubmissions()) {
					reject(makeFormNotAcceptingSubmissionsError(`Form with id ${ form.getId() } is not accepting submissions.`))
				}

				if (form.isSubmitOnce()) {
					const [isUserFormSubmissionExist, isUserFormSubmissionExistError] = await safeAsyncCall(submissionRepository.findBySubmitterIdAndFormId({
						submitterId: submission.getSubmitterId(),
						formId: submission.getFormId()
					}))

					if (isUserFormSubmissionExist) {
						reject(makeSubmissionAlreadyExistError(`User with id ${ submission.getSubmitterId() } has already submitted to form with id ${ submission.getFormId() }.`))
					}
				}

				if (form.isTest()) {
					submission.checkUp()
				}

				const [result, insertionError] = await safeAsyncCall(submissionRepository.insert({
					id: submission.getId(),
					submitterId: submission.getSubmitterId(),
					formId: submission.getFormId(),
					createdOn: submission.getCreatedOn(),
					answers: submission.getAnswers(),
					isChecked: submission.isChecked(),
					points: submission.getPoints(),
					checkedAnswers: submission.getCheckedAnswers(),
				}))

				if (!result) {
					reject(insertionError)
				}

				user.pushSubmission(submission.getId())
				form.pushSubmission(submission.getId())

				const [updatedUser, updatedUserError] = await safeAsyncCall(userRepository.update({
					submissions: user.getSubmissions(),
				}))

				const [updatedForm, updatedFormError] = await safeAsyncCall(formRepository.update({
					submissions: form.getSubmissions(),
				}))

				// TODO: Add error handling for user and form update
				resolve(Object.freeze({
					id: submission.getId(),
					submitterId: submission.getSubmitterId(),
					formId: submission.getFormId(),
					createdOn: submission.getCreatedOn(),
				}))
			})
		}
}