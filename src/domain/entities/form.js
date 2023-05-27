const FORM_VIEW_TYPES = {
	LIST: 'list',
	STEPS: 'steps',
}

function mapQuestions(questions) {
	return questions.map(question => ({
		...question.toObject(),
	}))
}

function mapQuestionsForSubmission(questions, shuffleArrayFunction, shuffle) {
	let mappedQuestions = questions.map(question => ({
		...question.toSecureObject(),
	}))

	if (shuffleArrayFunction && shuffle) {
		mappedQuestions = shuffleArrayFunction(mappedQuestions)
	}

	return mappedQuestions
}

function aggregateMaxPoints(formQuestions) {
	return formQuestions.reduce((acc, curr) => {
		acc += parseInt(curr.getMaxPoints())

		return acc
	}, 0)
}

module.exports = function buildMakeForm ({
		Id,
		makeFormQuestion,
		shuffleArray,
	}={}) {
		return function makeForm({
			_id = Id.makeId(),
			authorId,
			title,
			description='',
			questions,
			createdOn = Date.now(),
			updatedOn = Date.now(),
			submissions = [],

			settings = {
				isTest = false,
				generalTimeLimit = 0, // 0 means no limit
				questionDefaultTimeLimit = 0, // 0 means no limit
				mixQuestions = false,
				confirmText,
				doNotAcceptSubmissions = false,
				formView = FORM_VIEW_TYPES.LIST,
				isAnonymous = false,
				allQuestionsRequired = false,
				submitOnce = true,
				showResultsAfter = 'submission' // 'submission' or 'check'
			} = {},
		} = {}) {

			if (!Id.isValidId(_id)) {
				throw new Error('Form must have a valid id.')
			}

			if (!authorId) {
				throw new Error('Form must have an author id.')
			}

			if (!title) {
				throw new Error('Form must have a title.')
			}

			if (!questions) {
				throw new Error('Form must have questions.')
			}

			if (!Array.isArray(questions)) {
				throw new Error('Form questions must be an array.')
			}

			const sanitizedTitle = title.trim()
			const sanitizedDescription = description.trim()
			const formQuestions = questions.map(question => makeFormQuestion(question))
			const formSubmissions = [...submissions]

			return Object.freeze({
				// Getters
				getId: () => _id,
				getAuthorId: () => authorId,
				getCreatedOn: () => createdOn,
				getUpdatedOn: () => updatedOn,
				getSubmissions: () => formSubmissions,
				getPlainQuestions: () => mapQuestions(formQuestions),
				getQuestions: () => formQuestions,
				getTitle: () => sanitizedTitle,
				getDescription: () => sanitizedDescription,

				// Settings
				getSettings: () => settings,
				getGeneralTimeLimit: () => settings.generalTimeLimit,
				getQuestionDefaultTimeLimit: () => settings.questionDefaultTimeLimit,
				getMixQuestions: () => settings.mixQuestions,
				getConfirmText: () => settings.confirmText,
				getFormView: () => settings.formView,
				getShowResultsAfter: () => settings.showResultsAfter,
				getMaxPoints: () => aggregateMaxPoints(formQuestions),

				isTest: () => settings.isTest,
				isAcceptingSubmissions: () => !settings.doNotAcceptSubmissions,
				isAnonymous: () => settings.isAnonymous,
				isAllQuestionsRequired: () => settings.allQuestionsRequired,
				isSubmitOnce: () => settings.submitOnce,

				// General mutations methods
				update: () => updatedOn = Date.now(),
				addSubmission: (submissionId) => formSubmissions.push(submissionId),
				removeSubmission: (submissionId) => formSubmissions.splice(formSubmissions.indexOf(submissionId), 1),

				// Formatting methods
				toObject: () => ({
					_id,
					authorId,
					createdOn,
					updatedOn,
					settings,
					title: sanitizedTitle,
					description: sanitizedDescription,
					submissions: formSubmissions,
					questions: mapQuestions(formQuestions),
				}),

				toMetaDataObject: () => ({
					_id,
					authorId,
					title: sanitizedTitle,
					description: sanitizedDescription,
					createdOn,
					submissionsCount: formSubmissions.length,
					maxPoints: aggregateMaxPoints(formQuestions),

					settings: {
						isAllQuestionsRequired: settings.allQuestionsRequired,
						mixQuestions: settings.mixQuestions,
						formView: settings.formView,
						questionDefaultTimeLimit: settings.questionDefaultTimeLimit,
						generalTimeLimit: settings.generalTimeLimit,
						showResultsAfter: settings.showResultsAfter,
					}
				}),

				toSubmissionFormat: () => ({
					_id,
					authorId,
					title: sanitizedTitle,
					description: sanitizedDescription,
					questions: mapQuestionsForSubmission(formQuestions, shuffleArray, settings.mixQuestions),

					settings: {
						isAllQuestionsRequired: settings.allQuestionsRequired,
						mixQuestions: settings.mixQuestions,
						formView: settings.formView,
						questionDefaultTimeLimit: settings.questionDefaultTimeLimit,
						generalTimeLimit: settings.generalTimeLimit,
					}
				})
			})
		}
}