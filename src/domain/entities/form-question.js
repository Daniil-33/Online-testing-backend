const FORM_QUESTION_TYPES = {
	SHORT_TEXT_ANSWER: 'short-text-answer',
	DETAILED_TEXT_ANSWER: 'detailed-text-answer',
	SINGLE_OPTION: 'single-option',
	MULTIPLE_OPTIONS: 'multiple-options',
	SINGLE_OPTIONS_GRID: 'single-options-grid',
	MULTIPLE_OPTIONS_GRID: 'multiple-options-grid',
}

// Validators
function shortTextValidator(answer, answerSettings) {
	const sanitizedAnswer = answer.trim().toLowerCase()
	const matchedCorrectAnswer = answerSettings.options.find(option => option.text.trim().toLowerCase() === sanitizedAnswer)

	return {
		checkedAnswerData: {
			answer: answer
		},
		points: matchedCorrectAnswer ? answerSettings.points : 0
	}
}

function detailedTextValidator(answer, answerSettings) {
	return {
		checkedAnswerData: {
			answer: answer
		},
		points: 0
	}
}

function singleOptionValidator(answer, answerSettings) {
	const matchedCorrectAnswer = answerSettings.options.find(option => option.id === answer.selected)
	const isCustomAnswerAvailable = answerSettings.options.some(option => option.isCustomAnswer)
	const isSelectedAnswerCustom = answerSettings.options.find(option => option.id === answer.selected)?.isCustomAnswer

	return {
		checkedAnswerData: {
			answer: answer.selected,
			customAnswer: isSelectedAnswerCustom ? answer.customAnswerText : null
		},
		points: isCustomAnswerAvailable ? 0 : (matchedCorrectAnswer ? answerSettings.points : 0)
	}
}

function multipleOptionsValidator(answer, answerSettings) {
	const isAllSelectedOptionsCorrect = answer.selected.every(selectedOption => answerSettings.options.some(option => option.id === selectedOption)) && answer.selected.length === answerSettings.options.length
	const isCustomAnswerAvailable = answerSettings.options.some(option => option.isCustomAnswer)
	const isAnySelectedOptionCustom = answer.selected.some(selectedOption => answerSettings.options.find(option => option.id === selectedOption)?.isCustomAnswer)

	return {
		checkedAnswerData: {
			answer: answer.selected,
			customAnswer: isAnySelectedOptionCustom ? answer.customAnswerText : null
		},
		points: isCustomAnswerAvailable ? 0 : (isAllSelectedOptionsCorrect ? answerSettings.points : 0)
	}
}

function singleOptionsGridValidator(answer, answerSettings) {
	const aggregatedPoints = Object.entries(answerSettings).reduce((totalPoints, [ rowId, { id: correctColId, points } ]) => {
		const isSelectedColCorrect = answer[rowId] === correctColId

		return totalPoints + (isSelectedColCorrect ? points : 0)
	}, 0)

	return {
		checkedAnswerData: {
			answer: answer
		},
		points: aggregatedPoints
	}
}

function multipleOptionsGridValidator(answer, answerSettings) {
	const aggregatedPoints = Object.entries(answerSettings).reduce((totalPoints, [ rowId, { id: correctColIds, points } ]) => {
		const isSelectedColCorrect = correctColIds.every(colId => answer[rowId].includes(colId))

		return totalPoints + (isSelectedColCorrect ? points : 0)
	}, 0)

	return {
		checkedAnswerData: {
			answer: answer
		},
		points: aggregatedPoints
	}
}

function getValidator (questionType) {
	switch (questionType) {
		case FORM_QUESTION_TYPES.SHORT_TEXT_ANSWER:
			return shortTextValidator
		case FORM_QUESTION_TYPES.DETAILED_TEXT_ANSWER:
			return detailedTextValidator
		case FORM_QUESTION_TYPES.SINGLE_OPTION:
			return singleOptionValidator
		case FORM_QUESTION_TYPES.MULTIPLE_OPTIONS:
			return multipleOptionsValidator
		case FORM_QUESTION_TYPES.SINGLE_OPTIONS_GRID:
			return singleOptionsGridValidator
		case FORM_QUESTION_TYPES.MULTIPLE_OPTIONS_GRID:
			return multipleOptionsGridValidator
		default:
			return (() => null)
	}
}

// Is has answer checkers
function hasShortTextAnswer(answer) {
	return typeof answer === 'string' && answer.length > 0
}

function hasDetailedTextAnswer(answer) {
	return typeof answer === 'string' && answer.length > 0
}

function hasSingleOptionAnswer(answer) {
	return answer?.selected !== null && answer.selected !== undefined
}

function hasMultipleOptionsAnswer(answer) {
	return answer?.selected !== null && answer.selected !== undefined && answer.selected.length > 0
}

function hasSingleOptionsGridAnswer(answer) {
	return typeof answer === 'object' && Object.values(answer).length > 0 && Object.values(answer).every(value => value !== null && value !== undefined)
}

function hasMultipleOptionsGridAnswer(answer) {
	return typeof answer === 'object' && Object.values(answer).length > 0 && Object.values(answer).every(value => Array.isArray(value) && value.length > 0)
}

function getHasAnswerChecker (questionType) {
	switch (questionType) {
		case FORM_QUESTION_TYPES.SHORT_TEXT_ANSWER:
			return hasShortTextAnswer
		case FORM_QUESTION_TYPES.DETAILED_TEXT_ANSWER:
			return hasDetailedTextAnswer
		case FORM_QUESTION_TYPES.SINGLE_OPTION:
			return hasSingleOptionAnswer
		case FORM_QUESTION_TYPES.MULTIPLE_OPTIONS:
			return hasMultipleOptionsAnswer
		case FORM_QUESTION_TYPES.SINGLE_OPTIONS_GRID:
			return hasSingleOptionsGridAnswer
		case FORM_QUESTION_TYPES.MULTIPLE_OPTIONS_GRID:
			return hasMultipleOptionsGridAnswer
		default:
			return (() => null)
	}
}


module.exports = function buildMakeFormQuestion ({ Id }) {
	return function makeFormQuestion({
		id,
		title,
		type,
		answerSettings = {},
		content = {},
		isRequired = false,
		createdOn = Date.now(),
		timeLimit = 0,
	} = {}) {
		if (!title) {
			throw new Error('Form question must have a question.')
		}

		if (!type) {
			throw new Error('Form question must have a type.')
		}

		if (!Object.values(FORM_QUESTION_TYPES).includes(type)) {
			throw new Error('Form question must have a valid type.')
		}

		const validator = getValidator(type)
		const hasAnswerChecker = getHasAnswerChecker(type)
		const sanitizedTitle = title.trim()

		let currentQuestionAnswer = null

		return Object.freeze({
			getId: () => id,
			getType: () => type,
			getCreatedOn: () => createdOn,
			getAnswerSettings: () => answerSettings,
			getContent: () => content,
			isRequired: () => isRequired,
			getTimeLimit: () => timeLimit,
			getTitle: () => sanitizedTitle,

			setAnswer: (newAnswer) => currentQuestionAnswer = newAnswer,
			validateAnswer: () => validator(currentQuestionAnswer, answerSettings),
			hasAnswer: () => hasAnswerChecker(currentQuestionAnswer),

			// Secure object don't have any info about right answers
			toSecureObject: () => ({
				id,
				title: sanitizedTitle,
				type,
				content,
				isRequired,
				timeLimit,
			}),
			toObject: () => ({
				id,
				title: sanitizedTitle,
				type,
				content,
				isRequired,
				timeLimit,
				answerSettings,
			})
		})
	}
}