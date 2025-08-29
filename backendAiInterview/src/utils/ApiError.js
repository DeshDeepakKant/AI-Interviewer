class ApiError extends Error {
  constructor(statusCode, message = "Something went wrong", data = null) {
    super(message); // Call the parent class constructor
    this.statusCode = statusCode;
    this.data = data;
    this.message = message;
    this.success = false;

    Error.captureStackTrace(this, this.constructor);
  }
}

export { ApiError };
