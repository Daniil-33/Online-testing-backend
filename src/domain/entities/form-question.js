const FORM_QUESTION_TYPES = {
	SHORT_TEXT_ANSWER: 'short-text-answer',
	DETAILED_TEXT_ANSWER: 'detailed-text-answer',
	SINGLE_OPTION: 'single-option',
	MULTIPLE_OPTIONS: 'multiple-options',
	SINGLE_OPTIONS_GRID: 'single-options-grid',
	MULTIPLE_OPTIONS_GRID: 'multiple-options-grid',
}

// Validators
function shortTextValidator(content, answer, answerSettings, withCorrectAnswers = false) {
	const sanitizedAnswer = answer.trim().toLowerCase()
	const matchedCorrectAnswer = answerSettings.options.find(option => option.text.trim().toLowerCase() === sanitizedAnswer)

	return {
		answerData: {
			answer: answer,
			...(withCorrectAnswers ? {
				isCorrectAnswer: !!matchedCorrectAnswer,
				correctAnswersData: answerSettings.options.map(({ text }) => text),
				maxPoints: answerSettings.points
			} : {})
		},
		points: matchedCorrectAnswer ? answerSettings.points : 0
	}
}

function detailedTextValidator(content, answer, answerSettings, withCorrectAnswers = false) {
	return {
		answerData: {
			answer: answer,
			maxPoints: answerSettings.points
		},
		points: 0
	}
}

function singleOptionValidator(content, answer, answerSettings, withCorrectAnswers = false) {
	const matchedCorrectAnswer = answerSettings.options.find(id => id === answer.selected)
	const isCustomAnswerAvailable = content.options.some(option => option.isCustomAnswer)
	const isSelectedAnswerCustom = content.options.find(option => option.id === answer.selected)?.isCustomAnswer

	return {
		answerData: {
			answer: answer.selected,
			customAnswer: isSelectedAnswerCustom ? answer.customAnswerText : null,

			...(withCorrectAnswers ? {
				isCorrectAnswer: !!matchedCorrectAnswer,
				correctAnswersData: answerSettings.options,
				maxPoints: answerSettings.points
			} : {})
		},
		points: isCustomAnswerAvailable ? 0 : (matchedCorrectAnswer ? answerSettings.points : 0)
	}
}

function multipleOptionsValidator(content, answer, answerSettings, withCorrectAnswers = false) {
	const isAllSelectedOptionsCorrect = answer.selected.every(selectedOption => answerSettings.options.some(id => id === selectedOption)) && answer.selected.length === answerSettings.options.length
	const isCustomAnswerAvailable = content.options.some(option => option.isCustomAnswer)
	const isAnySelectedOptionCustom = answer.selected.some(selectedOption => content.options.find(option => option.id === selectedOption)?.isCustomAnswer)

	return {
		answerData: {
			answer: answer.selected,
			customAnswer: isAnySelectedOptionCustom ? answer.customAnswerText : null,

			...(withCorrectAnswers ? {
				isCorrectAnswer: isAllSelectedOptionsCorrect,
				correctAnswersData: answerSettings.options.map((id) => id),
				maxPoints: answerSettings.points
			} : {})
		},
		points: isCustomAnswerAvailable ? 0 : (isAllSelectedOptionsCorrect ? answerSettings.points : 0)
	}
}

function singleOptionsGridValidator(content, answer, answerSettings, withCorrectAnswers = false) {
	const aggregatedPoints = Object.entries(answerSettings).reduce((calculatedPoints, [ rowId, { id: correctColId, points } ]) => {
		const isSelectedColCorrect = answer[rowId] === correctColId
		calculatedPoints[rowId] = isSelectedColCorrect ? points : 0

		return calculatedPoints
	}, {})

	return {
		answerData: {
			answer: answer,

			...(withCorrectAnswers ? {
				isCorrectAnswer: Object.entries(answerSettings).every(([ rowId, { id: correctColId } ]) => answer[rowId] === correctColId),
				correctAnswersData: Object.entries(answerSettings).reduce((correctAnswersData, [ rowId, { id: correctColId } ]) => {
					return {
						...correctAnswersData,
						[rowId]: correctColId
					}
				}, {}),
				maxPoints: Object.fromEntries(Object.entries(answerSettings).map(([ rowId, { points } ]) => [ rowId, points ]))
			} : {})
		},
		points: aggregatedPoints
	}
}

function multipleOptionsGridValidator(content, answer, answerSettings, withCorrectAnswers = false) {
	const aggregatedPoints = Object.entries(answerSettings).reduce((calculatedPoints, [ rowId, { id: correctColIds, points } ]) => {
		const isSelectedColCorrect = correctColIds.every(colId => answer[rowId].includes(colId))
		calculatedPoints[rowId] = isSelectedColCorrect ? points : 0

		return calculatedPoints
	}, {})

	return {
		answerData: {
			answer: answer,

			...(withCorrectAnswers ? {
				isCorrectAnswer: Object.entries(answerSettings).every(([ rowId, { id: correctColIds } ]) => correctColIds.every(colId => answer[rowId].includes(colId))),
				correctAnswersData: Object.entries(answerSettings).reduce((correctAnswersData, [ rowId, { id: correctColIds } ]) => {
					return {
						...correctAnswersData,
						[rowId]: correctColIds
					}
				}, {}),
				maxPoints: Object.fromEntries(Object.entries(answerSettings).map(([ rowId, { points } ]) => [ rowId, points ]))
			} : {}),
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

function aggregateMaxPoints(answerSettings) {
	const maxPoints = !answerSettings.points && typeof answerSettings === 'object' ? Object.values(answerSettings).reduce((sum, { points }) => {
		sum += parseFloat(points)

		return sum
	}, 0) : (parseFloat(answerSettings.points) || 0)

	return maxPoints
}


module.exports = function buildMakeFormQuestion ({ Id }) {
	return function makeFormQuestion({
		id,
		title,
		type,
		answerSettings = {},
		content = {},
		isRequired = false,
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
			getAnswerSettings: () => answerSettings,
			getContent: () => content,
			isRequired: () => isRequired,
			getTimeLimit: () => timeLimit,
			getTitle: () => sanitizedTitle,
			getMaxPoints: () => aggregateMaxPoints(answerSettings),

			setAnswer: (newAnswer) => currentQuestionAnswer = newAnswer,
			validateAnswer: () => validator(content, currentQuestionAnswer, answerSettings),
			hasAnswer: () => hasAnswerChecker(currentQuestionAnswer),

			// Secure object don't have any info about right answers
			toSecureObject: function () {
				return {
					id,
					title: sanitizedTitle,
					type,
					content,
					isRequired,
					timeLimit,
				}
			},
			toObject: function () {
				return {
					...(this.toSecureObject()),
					answerSettings,
				}
			},
			renderQuestionWithAnswer: function (answer, withCorrectAnswers) {
				const { answerData } = validator(content, answer, answerSettings, withCorrectAnswers)

				return {
					...this.toSecureObject(),
					answerData
				}
			},
		})
	}
}