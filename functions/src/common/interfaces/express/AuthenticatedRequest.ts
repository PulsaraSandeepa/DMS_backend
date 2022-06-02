import {Request} from "express";
import admin, {auth} from "firebase-admin";
import {UserType} from "../../types/UserType";


export default class AuthenticatedRequest<T=any> {
    request: Request;

    constructor(req: Request) {
      this.request = req;
    }

    async getUser(): Promise<auth.DecodedIdToken | null> {
      if ( this.request.idToken ) {
        return await admin.auth().verifyIdToken(this.request.idToken);
      }

      return null;
    }

    async getTeacherUid(): Promise<string | null> {
      const user = await this.getUser();
      const userType = await this.getUserType();
      // const body = this.getDefaultBody();

      let teacherUid: string | null = null;

      // for each role
      if ( UserType.ADMIN === userType ||
            UserType.STUDENT === userType ) {
        // for company admin and student, validate teacherUid

      } else if ( UserType.TEACHER === userType ) {
        teacherUid = user?.uid ? user.uid : null;
      }

      return teacherUid;
    }

    async getUserType(): Promise<UserType|null> {
      const user = await this.getUser();

      let userType: UserType | null = null;
      if ( user != null && user["role"] && user["role"].length > 0 ) {
        userType = UserType[user["role"]];
      }

      return userType;
    }

    getBody<T>(obj: T) : T {
      const body = this.getDefaultBody();
      const jsonObj = JSON.parse(JSON.stringify(body));

      if (typeof obj["fromJSON"] === "function") {
        obj["fromJSON"](jsonObj);
      } else {
        for (const propName in jsonObj) {
          if ( typeof obj["hasOwnProperty"] === "function" &&
                Object.prototype.hasOwnProperty.call(obj, propName) ) {
            obj[propName] = jsonObj[propName];
          }
        }
      }

      return obj;
    }

    getDefaultBody(): any {
      return this.request.body;
    }
}
