// Custom error class for API errors
class ApiError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true; // marks "expected" errors (bad input, not found, etc.)
    Error.captureStackTrace(this, this.constructor);
  }
}

export default ApiError;