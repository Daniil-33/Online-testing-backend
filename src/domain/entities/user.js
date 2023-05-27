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
			// Getters
			getId: () => _id,
			getUserName: () => userName,
			getCreatedOn: () => createdOn,
			getCreatedForms: () => userCreatedForms,
			getSubmissions: () => userSubmissions,
			getEmail: () => sanitizedEmail,
			getPassword: () => password,

			// General mutations methods
			addSubmission: (submissionId) => userSubmissions.push(submissionId),
			removeSubmission: (submissionId) => userSubmissions.splice(userSubmissions.indexOf(submissionId), 1),
			addCreatedForm: (formId) => userCreatedForms.push(formId),
			removeCreatedForm: (formId) => userCreatedForms.splice(userCreatedForms.indexOf(formId), 1),

			// Formatting methods
			toObject: () => ({
				_id,
				userName,
				password,
				createdOn,
				email: sanitizedEmail,
				createdForms: userCreatedForms,
				submissions: userSubmissions,
			}),

			toSecureObject: () => ({
				_id,
				userName,
				createdOn,
				email: sanitizedEmail,
				createdForms: userCreatedForms,
				submissions: userSubmissions,
			}),

			toMetaDataObject: () => ({
				_id,
				userName,
				email: sanitizedEmail,
			}),
		})
	}
}