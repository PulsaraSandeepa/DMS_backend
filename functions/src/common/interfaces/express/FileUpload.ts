export default class FileUpload {
    fieldname: string;
    filename: string;
    encoding: string;
    mimetype: string;
    path?:string;

    constructor(
        fieldname: string, filename: string,
        encoding: string, mimetype: string
    ) {
      this.fieldname = fieldname;
      this.filename = filename;
      this.encoding = encoding;
      this.mimetype = mimetype;
    }

    getExtension(): string {
      const parsed: string = this.filename ?
            this.filename.trim() :
            "";
      const split: string[] = parsed.split(".");

      if ( split.length > 0 ) {
        return split.slice(1).join(".");
      } else {
        return "";
      }
    }
}
