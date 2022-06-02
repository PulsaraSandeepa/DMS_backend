import {Request} from "express";

export default class PublicRequest<T=any> {
    request: Request;

    constructor(req: Request) {
      this.request = req;
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
