class ApiError extends Error {
  constructor(
    statusCode,
    message = "Something went wrong",
    errors = [],
    stack = ""
  ) {
    super(message);
    this.statusCode = statusCode;
    this.data = null;
    this.errors = errors;
    this.message = message;
    this.success = false;

    if (stack) {
      this.stack = stack; // Use provided stack trace if given
    } else {
      Error.captureStackTrace(this, this.constructor); // Generate a stack trace
    }
  }
}

export { ApiError };
