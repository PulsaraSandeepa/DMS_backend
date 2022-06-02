import {UserType} from "./../common/types/UserType";
import {validateToken} from "./../common/utils/utils";
import express from "express";
import cors from "cors";
import AuthenticatedRequest from "../common/interfaces/express/AuthenticatedRequest";
import JsonResponse from "../common/interfaces/express/JsonResponse";
import {createUser} from "../services/users";


// setup express and middleware
const app: express.Application = express();
app.use(cors({origin: true}));
app.use(express.json());

/**
 * Create User
 */
app.post("/create", (req, res, next) => validateToken(req, new JsonResponse(res), next, [
  UserType.COMPANY_ADMIN,
  UserType.ADMIN,
]), async (req, res) => createUser(new AuthenticatedRequest(req), res));


export default app;
