import UploadedFile from "./UploadedFile";

interface UploadResponse {
    success: boolean;
    message: string;
    data?: UploadedFile[];
}
export default UploadResponse;
