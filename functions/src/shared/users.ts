import admin from "firebase-admin";
import {DocumentSnapshot} from "@google-cloud/firestore";
import FSUser from "../common/interfaces/firebase/FSUser";

const db = admin.firestore();
const auth = admin.auth();
const COLLECTION_NAME = "users";

export const createAuthUser = (email: string, password: string)
  : Promise<admin.auth.UserRecord> => {
  return auth.createUser({
    email: email,
    password: password,
  });
};

export const deleteAuthUser = (uid: string)
  : Promise<void> => {
  return auth.deleteUser(uid);
};


export const createAuthStudent = (phoneNo: string)
  : Promise<admin.auth.UserRecord> => {
  return auth.createUser({
    phoneNumber: phoneNo,
    disabled: false,
  });
};

export const generateAuthToken = (userUid: string): Promise<string> => {
  return auth.createCustomToken(userUid);
};

export const toggleAuthUserDisableStatus = async (uid: string, status: boolean)
  : Promise<admin.auth.UserRecord> => {
  return auth.updateUser(uid, {
    disabled: status,
  });
};

export const setCustomUserClaims = (userUid: string, claims: any)
  : Promise<void> => {
  return auth.setCustomUserClaims(userUid, claims);
};

export const getAuthUserByEmail = (email: string)
  : Promise<admin.auth.UserRecord> => {
  return auth.getUserByEmail(email);
};

export const getAuthUserByPhoneNumber = (phoneNo: string)
  : Promise<admin.auth.UserRecord> => {
  return auth.getUserByPhoneNumber(phoneNo);
};

export const getAuthUserByUid = (uid: string)
  : Promise<admin.auth.UserRecord> => {
  return auth.getUser(uid);
};

const fromSnapshotToFS = (doc: DocumentSnapshot): FSUser => {
  const data : any = doc.data();

  const user : FSUser = {
    uid: doc.id,
    path: doc.ref.path,
    firstName: data["firstName"],
    lastName: data["lastName"],
    email: data["email"],
    type: data["type"],
    user: data["user"],
    phone: data["phone"],
    active: data["active"],
    createdAt: data["createdAt"],
  };
  return user;
};

export const getUserByUid = async (uid: string) : Promise<FSUser> => {
  const userDoc : DocumentSnapshot = await db.collection(COLLECTION_NAME)
      .doc(uid).get();
  return fromSnapshotToFS(userDoc);
};

export const getGradesByUids = async (uids: string[]) : Promise<FSUser[]> => {
  const userPromises: Promise<FSUser>[] = [];
  uids.forEach((uid) => {
    userPromises.push(getUserByUid(uid));
  });

  const users: FSUser[] = [];
  const settled = await Promise.allSettled(userPromises);
  settled.forEach((i) => {
    if (i.status === "fulfilled") {
      users.push(i.value);
    }
  });

  return users;
};

export const addUser = async (uid: string, data: FSUser)
  : Promise<FirebaseFirestore.WriteResult> => {
  return db.collection(COLLECTION_NAME).doc(uid).set(data);
};

export const toggleUserDisableStatus =
  async (userUid: string, status: boolean)
  : Promise<FirebaseFirestore.WriteResult> => {
    return await db.collection(COLLECTION_NAME).doc(userUid)
        .update({
          disabled: status,
        });
  };
