class ApiError extends Error {
  constructor(statusCode, data = null, message = "Something went wrong") {
    super(message); // Call the parent class constructor
    this.statusCode = statusCode;
    this.data = data;
    this.message = message;
    this.success = false;

    Error.captureStackTrace(this, this.constructor);
  }
}

export { ApiError };
