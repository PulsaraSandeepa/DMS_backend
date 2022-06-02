
import {Timestamp} from "@google-cloud/firestore";

import FSUser from "../interfaces/firebase/FSUser";
import BaseClass from "./BaseClass";
import {UserType} from "../types/UserType";


export default class User extends BaseClass<User, FSUser> {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    type: UserType;
    user: string;
    active = true

    createdAt: Timestamp = Timestamp.now();

    constructor(
        firstName: string, lastName: string, email: string, phone: string, type: UserType, userUid: string,
    ) {
      super();
      this.firstName = firstName;
      this.lastName = lastName;
      this.email = email;
      this.phone = phone;
      this.type = type;
      this.user = userUid;
    }

    equals(obj: User): boolean {
      if ( this.path && obj.path && this.path === obj.path ) {
        return true;
      }
      if ( this.uid && obj.uid && this.uid === obj.uid ) {
        return true;
      }
      if ( this.user && obj.user && this.user === obj.user ) {
        return true;
      }
      if ( this.email && obj.email && this.email === obj.email ) {
        return true;
      }
      return false;
    }

    getProperties() : FSUser {
      const props: FSUser = {
        firstName: this.firstName,
        lastName: this.lastName,
        phone: this.phone,
        email: this.email,
        type: this.type,
        user: this.user,
        active: this.active,

        createdAt: Timestamp.fromDate(this.createdAt.toDate()),
      };


      return props;
    }
}
