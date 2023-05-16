module.exports = function buildMakeUser ({
	Id,
	isEmailValid,
}) {
	return function makeUser({
		_id = Id.makeId(),
		userName=`user-${ Id.makeId() }`,
		email,
		password,
		createdOn = Date.now(),

		createdForms = [],
		submissions = [],
	} = {}) {
		if (!Id.isValidId(_id)) {
			throw new Error('User must have a valid id.')
		}

		if (!userName) {
			throw new Error('User must have a user name.')
		}

		if (!email) {
			throw new Error('User must have an email.')
		}

		if (!isEmailValid(email)) {
			throw new Error('User must have a valid email.')
		}

		if (!password) {
			throw new Error('User must have a password.')
		}

		if (password.length < 6) {
			throw new Error('Password must be at least 6 characters long.')
		}

		const sanitizedEmail = email.trim().toLowerCase()
		const userSubmissions = [...submissions]
		const userCreatedForms = [...createdForms]

		return Object.freeze({
			getId: () => _id,
			getUserName: () => userName,
			getCreatedOn: () => createdOn,
			getCreatedForms: () => userCreatedForms,
			getSubmissions: () => userSubmissions,
			getEmail: () => sanitizedEmail,
			getPassword: () => password,

			pushSubmission: (submissionId) => userSubmissions.push(submissionId),
			pushCreatedForm: (formId) => userCreatedForms.push(formId),
		})
	}
}