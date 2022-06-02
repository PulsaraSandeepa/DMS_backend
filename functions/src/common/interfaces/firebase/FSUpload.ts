import {Timestamp} from "@google-cloud/firestore";
import FSBase from "./FSBase";

interface FSUpload extends FSBase {
    fileName: string;
    bucketPath: string;
    mimeType: string;
    extension: string;
    userUid?: string,
    createdAt: Timestamp;
}

export default FSUpload;
