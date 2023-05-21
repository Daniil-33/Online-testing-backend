const FORM_VIEW_TYPES = {
	LIST: 'list',
	STEPS: 'steps',
}

function mapQuestions(questions) {
	return questions.map(question => ({
		id: question.getId(),
		title: question.getTitle(),
		type: question.getType(),
		answerSettings: question.getAnswerSettings(),
		content: question.getContent(),
		isRequired: question.isRequired(),
	}))
}

function mapQuestionsForSubmission(questions) {
	return questions.map(question => ({
		id: question.getId(),
		title: question.getTitle(),
		type: question.getType(),
		content: question.getContent(),
		isRequired: question.isRequired(),
	}))
}

module.exports = function buildMakeForm ({
		Id,
		makeFormQuestion
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
				getId: () => _id,
				getAuthorId: () => authorId,
				getCreatedOn: () => createdOn,
				getUpdatedOn: () => updatedOn,
				getSubmissions: () => formSubmissions,
				getPlainQuestions: () => mapQuestions(formQuestions),
				getQuestions: () => formQuestions,
				getTitle: () => sanitizedTitle,
				getDescription: () => sanitizedDescription,

				getGeneralTimeLimit: () => settings.generalTimeLimit,
				getQuestionDefaultTimeLimit: () => settings.questionDefaultTimeLimit,
				getMixQuestions: () => settings.mixQuestions,
				getConfirmText: () => settings.confirmText,
				getFormView: () => settings.formView,

				getSettings: () => settings,

				isTest: () => settings.isTest,
				isAcceptingSubmissions: () => !settings.doNotAcceptSubmissions,
				isAnonymous: () => settings.isAnonymous,
				isAllQuestionsRequired: () => settings.allQuestionsRequired,
				isSubmitOnce: () => settings.submitOnce,

				pushSubmission: (submissionId) => formSubmissions.push(submissionId),

				toObject: () => ({
					_id,
					authorId,
					title: sanitizedTitle,
					description: sanitizedDescription,
					questions: mapQuestions(formQuestions),
					createdOn,
					updatedOn,
					submissions: formSubmissions,
					settings
				}),
				toMetaDataObject: () => ({
					_id,
					authorId,
					title: sanitizedTitle,
					description: sanitizedDescription,
					createdOn,
				}),
				toSubmissionFormat: () => ({
					_id,
					authorId,
					title: sanitizedTitle,
					description: sanitizedDescription,
					questions: mapQuestionsForSubmission(formQuestions),

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