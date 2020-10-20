/**
 * Base class for custom errors.
 */
export class CustomError extends Error {
  constructor(message: string) {
    super(message);
    // Set a more specific name. This will show up in e.g. console.log.
    this.name = this.constructor.name;
  }
}

/**
 * Base class for a custom error which wraps another error.
 */
export class WrappedError extends CustomError {
  public readonly originalError: Error;

  constructor(
    message: string,
    originalError: Error,
  ) {
    super(message);
    this.originalError = originalError;
  }
}
