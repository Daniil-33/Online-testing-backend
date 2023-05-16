const ERROR_MESSAGES = {
	empty: () => 'This field is required.',
	minLength: (length) => `This field must be at least ${length} characters long.`,
	maxLength: (length) => `This field must be at most ${length} characters long.`,
	isEmail: () => 'This field must be a valid email address.',
	toBeString: () => 'This field must be a string.',
	toBeNumber: () => 'This field must be a number.',
	toBeBoolean: () => 'This field must be a boolean.',
	toBeArray: () => 'This field must be an array.',
	toBeObject: () => 'This field must be an object.',
}

class DataValidator {
	constructor() {
		this.data = {};
		this.errors = {};

		this.validationKey = null;
	}

	setData(data) {
		this.data = data;

		return this;
	}

	getData() {
		return this.data;
	}

	getErrors() {
		return this.errors;
	}

	hasErrors() {
		return Object.keys(this.errors).length > 0;
	}

	validate(key) {
		this.validationKey = key;

		return this;
	}

	notEmpty() {
		if (!this.data?.[this.validationKey]) {
			this.errors[this.validationKey]
				? this.errors[this.validationKey].push(ERROR_MESSAGES.empty())
				: this.errors[this.validationKey] = [ERROR_MESSAGES.empty()];
		}

		return this;
	}

	minLength(length) {
		if ((this.data[this.validationKey]?.length || 0) < length) {
			this.errors[this.validationKey]
				? this.errors[this.validationKey].push(ERROR_MESSAGES.minLength(length))
				: this.errors[this.validationKey] = [ERROR_MESSAGES.minLength(length)];
		}

		return this;
	}

	maxLength(length) {
		if (this.data[this.validationKey].length > length) {
			this.errors[this.validationKey]
				? this.errors[this.validationKey].push(ERROR_MESSAGES.maxLength(length))
				: this.errors[this.validationKey] = [ERROR_MESSAGES.maxLength(length)];
		}

		return this;
	}

	isEmail() {
		const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;

		if (!emailRegex.test(this.data?.[this.validationKey])) {
			this.errors[this.validationKey]
				? this.errors[this.validationKey].push(ERROR_MESSAGES.isEmail())
				: this.errors[this.validationKey] = [ERROR_MESSAGES.isEmail()];
		}

		return this;
	}

	toBeString() {
		if (typeof this.data?.[this.validationKey] !== 'string') {
			this.errors[this.validationKey]
				? this.errors[this.validationKey].push(ERROR_MESSAGES.toBeString())
				: this.errors[this.validationKey] = [ERROR_MESSAGES.toBeString()];
		}

		return this;
	}

	toBeNumber() {
		if (typeof this.data?.[this.validationKey] !== 'number') {
			this.errors[this.validationKey]
				? this.errors[this.validationKey].push(ERROR_MESSAGES.toBeNumber())
				: this.errors[this.validationKey] = [ERROR_MESSAGES.toBeNumber()];
		}

		return this;
	}

	toBeBoolean() {
		if (typeof this.data?.[this.validationKey] !== 'boolean') {
			this.errors[this.validationKey]
				? this.errors[this.validationKey].push(ERROR_MESSAGES.toBeBoolean())
				: this.errors[this.validationKey] = [ERROR_MESSAGES.toBeBoolean()];
		}

		return this;
	}

	toBeArray() {
		if (!Array.isArray(this.data?.[this.validationKey])) {
			this.errors[this.validationKey]
				? this.errors[this.validationKey].push(ERROR_MESSAGES.toBeArray())
				: this.errors[this.validationKey] = [ERROR_MESSAGES.toBeArray()];
		}

		return this;
	}

	toBeObject() {
		if (typeof this.data?.[this.validationKey] !== 'object') {
			this.errors[this.validationKey]
				? this.errors[this.validationKey].push(ERROR_MESSAGES.toBeObject())
				: this.errors[this.validationKey] = [ERROR_MESSAGES.toBeObject()];
		}

		return this;
	}
}

module.exports = DataValidator;