export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/** 401 - token missing, invalid or expired. */
export class UnauthorizedError extends ApiError {
  constructor(message = 'Your session is invalid or has expired.') {
    super(message, 401);
    this.name = 'UnauthorizedError';
  }
}

/** 403 - authenticated, but not allowed to see this. */
export class ForbiddenError extends ApiError {
  constructor(message = 'You do not have permission to view products.') {
    super(message, 403);
    this.name = 'ForbiddenError';
  }
}

/** The server answered, but the body did not match the Zod schema. */
export class ResponseValidationError extends Error {
  constructor(message = 'The server returned data in an unexpected format.') {
    super(message);
    this.name = 'ResponseValidationError';
  }
}

/** The request never completed (offline, CORS, server down). */
export class NetworkError extends Error {
  constructor(message = 'Could not reach the server.') {
    super(message);
    this.name = 'NetworkError';
  }
}
