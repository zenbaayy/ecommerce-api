/**
 * Custom error class so route handlers can just `throw new ApiError(...)`
 * and let the centralized error handler format the JSON response.
 *
 * errorCode is a short machine-readable string (e.g. "PRODUCT_NOT_FOUND"),
 * separate from the numeric HTTP statusCode -- this matches the spec's
 * { error_code, message, timestamp } schema.
 */
class ApiError extends Error {
  constructor(statusCode, errorCode, message) {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
  }
}

// Catches any request that didn't match a route above it.
function notFoundHandler(req, res, next) {
  next(
    new ApiError(
      404,
      "ROUTE_NOT_FOUND",
      `Route ${req.method} ${req.originalUrl} not found`
    )
  );
}

// Falls back to a generic code if a route ever throws a plain Error
// instead of an ApiError (e.g. an unexpected bug) -> still 500, still
// the same JSON shape, nothing ever leaks as raw/unformatted.
function defaultErrorCodeFor(statusCode) {
  if (statusCode === 400) return "VALIDATION_ERROR";
  if (statusCode === 404) return "NOT_FOUND";
  return "INTERNAL_SERVER_ERROR";
}

// Centralized error formatter -> every error in the app becomes this
// same standardized JSON shape, whatever caused it:
// { error_code, message, timestamp }
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || 500;
  const body = {
    error_code: err.errorCode || defaultErrorCodeFor(statusCode),
    message: err.message || "Internal Server Error",
    timestamp: new Date().toISOString()
  };
  res.status(statusCode).json(body);
}

module.exports = { ApiError, notFoundHandler, errorHandler };
