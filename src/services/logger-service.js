const MESSAGE_TYPES = {
	ERROR: 'ERROR',
	WARN: 'WARN',
	INFO: 'INFO',
}

class LoggerService {
	constructor(stamp='LOGGER') {
		this.stamp = stamp
	}

	getStamp() {
		return `[${ this.stamp }]`
	}

	joinMessage(stamp, date, messageType, message) {
		return `${stamp} : ${date} : [${ messageType } LOG]:: "${message}"`
	}

	error(message) {
		const date = new Date().toLocaleString()
		const stamp = this.getStamp()
		const loggerMessage = this.joinMessage(stamp, date, MESSAGE_TYPES.ERROR, message)

		console.log(loggerMessage)
	}

	warn(message) {
		const date = new Date().toLocaleString()
		const stamp = this.getStamp()
		const loggerMessage = this.joinMessage(stamp, date, MESSAGE_TYPES.WARN, message)

		console.log(loggerMessage)
	}

	info(message) {
		const date = new Date().toLocaleString()
		const stamp = this.getStamp()
		const loggerMessage = this.joinMessage(stamp, date, MESSAGE_TYPES.INFO, message)

		console.log(loggerMessage)
	}
}

module.exports.defaultLogger = new LoggerService('DEFAULT LOGGER')

module.exports.LoggerService = LoggerService