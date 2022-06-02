import admin, {auth} from "firebase-admin";
import EmailValidator from "email-validator";
import scrypt from "scrypt-async";
import base64 from "base-64";
// import config from "../../../.env.json";

import {Request, Response, NextFunction} from "express";
import JsonResponse from "../interfaces/express/JsonResponse";
import {UserType} from "../types/UserType";
// import {getClassByUid} from "../../shared/classes";
import {getAuthUserByUid} from "../../shared/users";

export const validateToken = async (req: Request, res: JsonResponse,
    next: NextFunction, requiredRoles: string[] = [])
    : Promise<Response | void> => {
  // Check if request is authorized with Firebase ID token
  if ((!req.headers.authorization ||
        !req.headers.authorization.startsWith("Bearer ")) &&
        !(req.cookies && req.cookies.__session)) {
    return res.status(403).json({
      success: false,
      message: "Unauthorized",
    });
  }

  let idToken;
  if (req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer ")) {
    // Read the ID Token from the Authorization header.
    idToken = req.headers.authorization.split("Bearer ")[1];
  } else if (req.cookies) {
    // Read the ID Token from cookie.
    idToken = req.cookies.__session;
  } else {
    // No cookie
    return res.status(403).json({
      success: false,
      message: "Unauthorized",
    });
  }

  try {
    req.idToken = idToken;
    const user: auth.DecodedIdToken = await admin.auth().verifyIdToken(idToken);
    const userRole: string | undefined = user["role"];

    // to check if valid to proceed
    let isValidToProceed = false;
    let userType: UserType | null = null;

    // to UserType
    if ( userRole && userRole.length > 0 ) {
      userType = UserType[userRole];
    }

    // validate user roles
    if ( requiredRoles && Array.isArray(requiredRoles) &&
          requiredRoles.length > 0 ) {
      if ( userRole && requiredRoles.includes(userRole) ) {
        // if user has a role && role can perform action
        isValidToProceed = true;
      } else if ( requiredRoles.includes( UserType.STUDENT ) ) {
        // check if calling user is a student
        const userRecord = await getAuthUserByUid(user.uid);
        if ( userRecord && userRecord.phoneNumber ) {
          // if student & student can perform action
          isValidToProceed = true;
          userType = UserType.STUDENT;
        }
      } else {
        return res.status(403).json({
          success: false,
          message: "Unauthorized. You do not have required role!",
        });
      }
    } else {
      isValidToProceed = true;
    }

    /*
     * body content validations
     */
    const body = req.body;

    // 1 - check if request has a `teacherUid` in body
    if ( Object.prototype.hasOwnProperty.call(body, "teacherUid") ) {
      isValidToProceed = false;

      // check if user can use the specified teacherUid
      const teacherUidInBody = body["teacherUid"];
      isValidToProceed = await checkTeacherUidUsageEligibility(teacherUidInBody,

          user, userType!);
    }

    // // 2 - check if request has a `classUid` in body
    // if ( Object.prototype.hasOwnProperty.call(body, "classUid") ) {
    //   isValidToProceed = false;

    //   // check if user can use the specified teacherUid
    //   const classUidInBody = body["classUid"];
    //   isValidToProceed = await checkClassUidUsageEligibility(classUidInBody,
    //       user, userType!);
    // }

    // proceed
    if ( isValidToProceed ) {
      return next();
    }

    return res.status(403).json({
      success: false,
      message: "Unauthorized. Please contact system administrator!",
    });
  } catch (error) {
    return res.status(403).json({
      success: false,
      message: `Unauthorized. ${error.message}`,
    });
  }
};

export const checkTeacherUidUsageEligibility = async (teacherUidInBody: string,
    user: auth.DecodedIdToken, requestingUserType: UserType)
    :Promise<boolean> => {
  // validate teacher

  // try {
  //   teacher = await getTeacherByUid(teacherUidInBody);
  // } catch (error) {}

  // if ( !teacher ) {
  //   throw new Error("Invalid `teacherUid` is in request body!");
  // }

  // validate user
  if ( requestingUserType ) {
    // company admin & students can use
    if ( UserType.ADMIN === requestingUserType ||
        UserType.STUDENT === requestingUserType ) {
      return true;
    }

    // teachers
    if ( UserType.TEACHER === requestingUserType ) {
      // same user can use
      if ( user.uid === teacherUidInBody ) {
        return true;
      } else {
        throw new Error("You cannot use a different `teacherUid` " +
          "in request body!");
      }
    }
  }

  return false;
};


// export const checkClassUidUsageEligibility = async (classUidInBody: string,
//     user: auth.DecodedIdToken, requestingUserType: UserType)
//   :Promise<boolean> => {
//   // validate clas
//   let classObject: FSClass | null = null;
//   try {
//     classObject = await getClassByUid(classUidInBody);
//   // eslint-disable-next-line no-empty
//   } catch (error) {}

//   if (!classObject) {
//     throw new Error("Invalid `classUid` is in request body!");
//   }

//   // const teacherUid = classObject.teacher;

//   // validate user
//   if (requestingUserType) {
//     // company admin & students can use
//     if (UserType.ADMIN === requestingUserType ||
//       UserType.STUDENT === requestingUserType) {
//       return true;
//     }

//     // // teachers
//     // if (UserType.TEACHER === requestingUserType) {
//     //   // same user can use
//     //   if (user.uid === teacherUid) {
//     //     return true;
//     //   } else {
// throw new Error("You cannot use a `classUid` belonging to another " +??
//     //       "teacher in request body!");
//     //   }
//     // }

//     // // data entry
//     // if (UserType.TEACHER_DATA_ENTRY === requestingUserType) {
//     //   // data entry must use the teacherUid from their claims
//     //   const claimTeacherUid: string | null = user["teacherUid"];

//     //   // same teacherUid can use
//     //   if (claimTeacherUid && claimTeacherUid === teacherUid) {
//     //     return true;
//     //   } else {
//     //     throw new Error("You cannot use a `classUid` belonging to " +
//     //       "another teacher in request body!");
//     //   }
//     // }
//   }

//   return false;
// };

export const isValidEmail = (email: string): boolean => {
  return EmailValidator.validate(email);
};

export const chunkArray = (myArray: any[], chunkSize: number): any[] =>{
  const results: any[] = [];

  while (myArray.length) {
    results.push(myArray.splice(0, chunkSize));
  }

  return results;
};

export const hashText = (SALT, text): Promise<any> => {
  return new Promise((resolve, reject) =>{
    scrypt(text, SALT, {
      N: 16384,
      r: 8,
      p: 1,
      dkLen: 16,
      encoding: "hex",
    }, (derivedKey) => {
      if ( derivedKey ) {
        resolve(derivedKey);
      } else {
        reject(new Error("Error in hashing!"));
      }
    });
  });
};

// export const encryptText = (text: string): string => {
//   const iv = crypto.randomBytes(16);
//   const cipher = crypto.createCipheriv(config.encryption.algorithm,
//       config.encryption.key, iv);
//   const encrypted = Buffer.concat([cipher.update(text), cipher.final()]);

//   const ivText = base64.encode( iv.toString("hex") );
//   const content = base64.encode( encrypted.toString("hex") );
//   const encryptedText = `${ivText}.${content}`;

//   return encryptedText;
// };

// export const decryptText = (text: string) : string => {
//   const split = text.split(".");
//   const ivText = base64.decode( split[0] );
//   const content = base64.decode( split[1] );

//   const decipher = crypto.createDecipheriv(config.encryption.algorithm,
//       config.encryption.key, Buffer.from(ivText, "hex"));
//   const decrpyted = Buffer.concat([decipher
//       .update(Buffer.from(content, "hex")), decipher.final()]);

//   return decrpyted.toString();
// };

export const encodeBase64 = (text: string): string => {
  return base64.encode( text );
};

export const decodeBase64 = (text: string): string => {
  return base64.decode( text );
};
