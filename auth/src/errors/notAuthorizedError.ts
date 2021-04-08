import { CustomError } from "./customError";

export class NotAuthorizedError extends CustomError {
  statusCode = 401;

  constructor() {
    super("Forbidden unauthorized access");

    Object.setPrototypeOf(this, NotAuthorizedError.prototype);
  }

  serializeError() {
    return [{ message: "Forbidden unauthorized access" }];
  }
}
