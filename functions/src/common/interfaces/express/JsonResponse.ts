import {Response} from "express";
import ResponseData from "./ResponseData";

export default class JsonResponse {
    response: Response;

    constructor(res: Response) {
      this.response = res;
    }

    status(code: number) {
      return this.response.status(code);
    }

    json(data: ResponseData): Response {
      return this.response.json(data);
    }
}
