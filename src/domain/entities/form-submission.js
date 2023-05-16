function checkAnswersAndCalculatePoints(form, answers) {
	if (!form.isTest()) return

	const {
		checkedAnswersData,
		calculatedPoints
	} = form
		.getQuestions()
		.reduce(({ checkedAnswersData, calculatedPoints }, question) => {
			const questionId = question.getId()
			const { checkedAnswerData, points } = question.validateAnswer(answers[questionId])

			checkedAnswersData[questionId] = {
				checkedAnswerData,
				points
			}

			calculatedPoints += points

			return { checkedAnswersData, calculatedPoints }
		}, { checkedAnswersData: {}, calculatedPoints: 0 })

	return {
		checkedAnswersData,
		calculatedPoints
	}
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
		id = Id.makeId(),
		submitterId,
		answers,
		createdOn = Date.now(),

		form,
		checkedAnswers={},
		isChecked=false,
		points=0,
	} = {}) {
		if (!Id.isValidId(id)) {
			throw new Error('Submission must have a valid id.')
		}

		if (!Id.isValidId(submitterId)) {
			throw new Error('Submission must have a valid submitter id.')
		}

		if (!form) {
			throw new Error('To init submission you must to pass the form instance.')
		}

		if (!answers) {
			throw new Error('Submission must have answers.')
		}

		if (typeof answers !== 'object' || Array.isArray(answers)) {
			throw new Error('Submission answers must be an object.')
		}

		let initialPoints = points
		let initialCheckedAnswers = checkedAnswers

		const emptyAnswers = checkIsAllRequiredQuestionsAnswered(form, answers)

		function checkUpSubmission() {
			if (form.isTest() && !points) {
				const { checkedAnswersData, calculatedPoints } = checkAnswersAndCalculatePoints(form, answers)

				initialPoints = calculatedPoints
				initialCheckedAnswers = checkedAnswersData
			}
		}

		function setAnswerPointsById(questionId, points) {
			if (initialCheckedAnswers[questionId] && initialCheckedAnswers[questionId].points !== points) {
				initialPoints -= initialCheckedAnswers[questionId].points
				initialPoints += points

				initialCheckedAnswers[questionId].points = points
			}
		}

		return Object.freeze({
			getId: () => id,
			getSubmitterId: () => submitterId,
			getFormId: () => form.getId(),
			getAnswers: () => answers,
			getCreatedOn: () => createdOn,
			getPoints: () => initialPoints,
			getCheckedAnswers: () => initialCheckedAnswers,
			getEmptyAnswers: () => emptyAnswers,

			isChecked: () => isChecked,

			checkUp: () => checkUpSubmission(),
			setAnswerPointsById,
		})
	}
}