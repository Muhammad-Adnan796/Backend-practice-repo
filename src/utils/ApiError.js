// Error handling in functional form

function ApiError(
  statusCode,
  message = "Something went wrong",
  errors = [],
  stack = ""
) {
  const apiErrors = new Error(message);
  console.log(apiErrors); /// this console is for checking error properties
  apiErrors.statusCode = statusCode;
  apiErrors.data = null;
  apiErrors.message = message;
  apiErrors.success = false;
  apiErrors.errors = errors;

  if (stack) {
    apiErrors.stack = stack;
  } else {
    Error.captureStackTrace(apiErrors, ApiError);
  }

  return apiErrors;
}

/* How to call this function in another file */

/* const myApiError = ApiError(404, "Resource not found", [
  { field: "id", message: "Invalid ID" },
]);
console.log(myApiError); */

// Error handling in class form

/* class ApiError extends Error {
  constructor(
    statusCode,
    message = "Something went wrong",
    errors = [],
    stack = ""
  ) {
    super(message);
    (this.statusCode = statusCode),
      (this.data = null),
      (this.message = message),
      (this.success = false),
      (this.errors = errors);
    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
} 
export { ApiError };
*/

export { ApiError };
