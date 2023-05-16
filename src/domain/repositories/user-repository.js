module.exports = function makeUserRepository ({ userRepositoryImplementation }) {
	return Object.freeze({
		insert,
		findById,
		findByEmail,
		updateById,
		deleteById,
	})

	async function insert({ id, ...userInfo }) {
		const db = await userRepositoryImplementation()
		const result = await db.insertOne({ _id: id, ...userInfo })

		return result.insertedId
	}

	async function findById({ id }) {
		const db = await userRepositoryImplementation()
		const result = await db.findOne({ _id: id })

		return result
	}

	async function findByEmail({ email }) {
		const db = await userRepositoryImplementation()
		const result = await db.findOne({ email })

		return result
	}

	async function updateById({ id, ...userInfo }) {
		const db = await userRepositoryImplementation()
		const result = await db.updateOne({ _id: id }, { $set: { ...userInfo } })

		return result.modifiedCount > 0 ? { id, ...userInfo } : null
	}

	async function deleteById({ id }) {
		const db = await userRepositoryImplementation()
		const result = await db.deleteOne({ _id: id })

		return result.deletedCount
	}
}