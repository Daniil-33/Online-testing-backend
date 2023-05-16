module.exports.SuccessUseCaseResult = class {
	constructor (data) {
		this.name = 'SuccessUseCaseResult';
		this.data = data;
	}

	getName () {
		return this.name;
	}

	getData () {
		return this.data;
	}

	toPlainObject () {
		return {
			success: true,
			data: this.data
		}
	}
}