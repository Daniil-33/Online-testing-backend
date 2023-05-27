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
		const result = await db.find({ _id: { $in: formIds } }).toArray()

		return result
	}

	async function findByAuthorId({ authorId }) {
		const db = await formRepositoryImplementation()
		const result = await db.find({ authorId }).toArray()

		return result
	}

	async function insert({ ...formData }) {
		const db = await formRepositoryImplementation()
		const result = await db.insertOne({ ...formData })

		return result.insertedId
	}

	async function updateById({ _id, ...formData }) {
		const db = await formRepositoryImplementation()
		const result = await db.updateOne({ _id }, { $set: { ...formData } })

		return result.modifiedCount > 0 ? { _id, ...formData } : null
	}

	async function deleteById({ id }) {
		const db = await formRepositoryImplementation()
		const result = await db.deleteOne({ _id: id })

		return result.deletedCount
	}
}