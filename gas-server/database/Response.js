class Response {
	constructor(status, message, data) {
		this.status = status;
		this.code = this.status;
		this.message = message;
		this.data = data;
		this.success = this.status >= 200 && this.status < 300;
		if (!this.success) {
			this.error = new Error(message);
		}
	}
}
