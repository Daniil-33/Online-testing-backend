function checkAnswersAndCalculatePoints(form, answers) {
	if (!form.isTest()) return

	const {
		checkedAnswersData,
		calculatedPoints
	} = form
		.getQuestions()
		.reduce((calculatedPoints, question) => {
			const questionId = question.getId()
			const { points } = question.validateAnswer(answers[questionId])


			calculatedPoints[questionId] = points

			return calculatedPoints
		}, {})

	return calculatedPoints
}

function checkIsAllRequiredQuestionsAnswered(form, answers) {
	const emptyAnswers = form
		.getQuestions()
		.reduce((emptyAnswers, question) => {
			const answer = answers[question.getId()]
			question.setAnswer(answer)

			if ((form.isAllQuestionsRequired() || question.isRequired()) && !question.hasAnswer()) {
				emptyAnswers.push(question.getId())
			}

			return emptyAnswers
		}, [])

	return emptyAnswers
}

module.exports = function buildMakeFormSubmission ({ Id, makeForm }) {
	return function makeSubmission({
		_id = Id.makeId(),
		submitterId,
		answers,
		createdOn = Date.now(),

		form,
		formId,
		isChecked=false,
		points={},
	} = {}) {
		if (!Id.isValidId(_id)) {
			throw new Error('Submission must have a valid id.')
		}

		if (!Id.isValidId(submitterId)) {
			throw new Error('Submission must have a valid submitter id.')
		}

		if (!answers) {
			throw new Error('Submission must have answers.')
		}

		if (typeof answers !== 'object' || Array.isArray(answers)) {
			throw new Error('Submission answers must be an object.')
		}

		const emptyAnswers = form && checkIsAllRequiredQuestionsAnswered(form, answers) || []
		let initialPoints = points

		function checkUpSubmission() {
			if (form && form.isTest() && !Object.keys(points || {}).length) {
				const calculatedPoints = checkAnswersAndCalculatePoints(form, answers)

				initialPoints = calculatedPoints
			}
		}

		function setPointsByAnswers(points={}) {
			Object.entries(points).forEach(([questionId, points]) => {
				if (initialPoints[questionId] !== points) {
					initialPoints[questionId] = points
				}
			})

			isChecked = true
		}

		return Object.freeze({
			getId: () => _id,
			getSubmitterId: () => submitterId,
			getFormId: () => formId || form.getId(),
			getAnswers: () => answers,
			getAnswer: questionId => answers[questionId],
			getCreatedOn: () => createdOn,
			getPoints: () => initialPoints,
			getEmptyAnswers: () => emptyAnswers,

			isChecked: () => isChecked,

			checkUp: () => checkUpSubmission(),
			setPointsByAnswers,

			toObject: () => ({
				_id,
				submitterId,
				formId,
				answers,
				createdOn,
				points: initialPoints,
			}),
			toMetaDataObject: () => ({
				_id,
				submitterId,
				formId,
				createdOn,
				points: initialPoints,
			})
		})
	}
}