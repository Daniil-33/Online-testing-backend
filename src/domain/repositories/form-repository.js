module.exports = function makeSubmissionRepository ({ formRepositoryImplementation }) {
	return Object.freeze({
		findById,
		findByIds,
		findByAuthorId,
		insert,
		updateById,
		deleteById,
	})

	async function findById({ id }) {
		const db = await formRepositoryImplementation()
		const result = await db.findOne({ _id: id })

		return result
	}

	async function findByIds({ formIds, attrs={} }) {
		const db = await formRepositoryImplementation()
		const result = await db.find({ _id: { $in: formIds } }).project(attrs).toArray()

		return result
	}

	async function findByAuthorId({ authorId, attrs={} }) {
		const db = await formRepositoryImplementation()
		const result = await db.find({ authorId }).project(attrs).toArray()

		return result
	}

	async function insert({ ...submissionInfo }) {
		const db = await formRepositoryImplementation()
		const result = await db.insertOne({ ...submissionInfo })

		return result.insertedId
	}

	async function updateById({ id, ...submissionInfo }) {
		const db = await formRepositoryImplementation()
		const result = await db.updateOne({ _id: id }, { $set: { ...submissionInfo } })

		return result.modifiedCount > 0 ? { id, ...submissionInfo } : null
	}

	async function deleteById({ id }) {
		const db = await formRepositoryImplementation()
		const result = await db.deleteOne({ _id: id })

		return result.deletedCount
	}
}