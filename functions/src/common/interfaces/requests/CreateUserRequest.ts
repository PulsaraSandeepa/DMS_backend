import {UserType} from "./../../types/UserType";
import RequestError from "../../errors/RequestError";
import BaseRequest from "./BaseRequest";

class CreateUserRequest extends BaseRequest {
  firstName: string | null = null;
  lastName: string | null = null;
  email: string | null = null;
  phone: string | null = null;
  password: string | null = null;
  type: UserType | null = null;

  constructor() {
    super();
  }

  getRequestErrors(): RequestError[] {
    const requestErrors: RequestError[] = [];

    if (this.firstName === null && this.lastName === null) {
      requestErrors.push(
          new RequestError("firstName, lastName", "FirstName and Last Name cannot be empty")
      );
    }

    if (this.email === null) {
      requestErrors.push(new RequestError("email", "Email cannot be empty"));
    }

    if (this.phone === null) {
      requestErrors.push(
          new RequestError("phone", "Phone cannot be empty")
      );
    }
    if (this.password === null) {
      requestErrors.push(
          new RequestError("password", "Password cannot be empty")
      );
    }

    if (this.type ===null) {
      requestErrors.push(new RequestError("type", "Type cannot be empty"));
    }


    return requestErrors;
  }
}

export default CreateUserRequest;
