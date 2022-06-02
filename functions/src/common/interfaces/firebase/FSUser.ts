import {Timestamp} from "@google-cloud/firestore";
import FSBase from "./FSBase";

interface FSUser extends FSBase {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    type: string;
    user: string;
    active: boolean;
    createdAt: Timestamp;
}

export default FSUser;
