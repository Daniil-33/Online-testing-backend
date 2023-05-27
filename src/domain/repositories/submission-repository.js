module.exports = function makeSubmissionRepository ({ submissionRepositoryImplementation }) {
	return Object.freeze({
		findById,
		findByFormId,
		findBySubmitterId,
		findBySubmitterIdAndFormId,
		insert,
		updateById,
		deleteById,
	})

	async function findById({ id }) {
		const db = await submissionRepositoryImplementation()
		const result = await db.findOne({ _id: id })

		return result
	}

	async function findByFormId({ formId }) {
		const db = await submissionRepositoryImplementation()
		const result = await db.find({ formId }).toArray()

		return result
	}

	async function findBySubmitterId({ submitterId }) {
		const db = await submissionRepositoryImplementation()
		const result = await db.find({ submitterId }).toArray()

		return result
	}

	async function findBySubmitterIdAndFormId({ submitterId, formId }) {
		const db = await submissionRepositoryImplementation()
		const result = await db.find({ submitterId, formId }).toArray()

		return result
	}

	async function insert({ ...submissionInfo }) {
		const db = await submissionRepositoryImplementation()
		const result = await db.insertOne({ ...submissionInfo })

		return result.insertedId
	}

	async function updateById({ id, ...submissionInfo }) {
		const db = await submissionRepositoryImplementation()
		const result = await db.updateOne({ _id: id }, { $set: { ...submissionInfo } })

		return result.modifiedCount > 0 ? { id, ...submissionInfo } : null
	}

	async function deleteById({ id }) {
		const db = await submissionRepositoryImplementation()
		const result = await db.deleteOne({ _id: id })

		return result.deletedCount
	}
}