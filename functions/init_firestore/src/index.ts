import config from "../../.env.json";
//import serviceAccount from "./credentials/firebase_adminsdk.json";
// set default timezone
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'

dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.tz.setDefault("Asia/Colombo")


// firebase data
const admin = require("firebase-admin");
admin.initializeApp({
  credential: applicationDefault(),//admin.credential.cert(serviceAccount),
  databaseURL: `https://${config.firebase.projectId}.firebaseio.com`,
  //storageBucket: `${config.firebase.projectId}.appspot.com`,
});

// imports
import { UserType } from "../../src/common/types/UserType";
import {
  createAuthUser,
  createUser,
  setCustomUserClaims,
} from "../../src/shared/users";
import { Timestamp } from "@google-cloud/firestore";
import {credential} from "firebase-admin";
import applicationDefault = credential.applicationDefault;

(async () => {
  try {
    console.log("🏁 Init script started!");

    // admin
    console.log(`⏰ Creating the Admin User`);
    await createAdminUser();
    console.log(`✅ Admin User created!`)

    console.log(`Init Script Finished!!`);
  } catch (e) {
    console.error(e);
    // Deal with the fact the chain failed
  }
})();

async function createAdminUser() {
  // create auth user
  const userRecord = await createAuthUser(
    config.instituteAdmin.email,
    config.instituteAdmin.password
  );
  var userUid = userRecord.uid;

  // set custom claims
  await setCustomUserClaims(userUid, { role: "COMPANY_ADMIN" });

  // create firestore document
  await createUser(userUid, {
    name: config.instituteAdmin.name,
    email: config.instituteAdmin.email,
    type: UserType.ADMIN,
    user: userUid,
    createdAt: Timestamp.now(),
  });

  console.log(`Created the Admin User ${config.instituteAdmin.email}`);
}

// async function createConfig() {
//   const configCollectionRef = db.collection("config");

//   await configCollectionRef.doc("recordedSessions").set({
//     cloudfrontEndpoint: "https://<>.cloudfront.net",
//     urlValidInSeconds: 240,
//   });
//   console.log("Added Recorded Session configuration\n");

//   const bucketPolicyCollectionRef = configCollectionRef
//     .doc("recordedSessions")
//     .collection("bucketPolicyStatements");

//   await bucketPolicyCollectionRef.doc("1").set({
//     Action: "s3:GetObject",
//     Effect: "Allow",
//     Principal: {
//       AWS: "arn:aws:iam::cloudfront:user/xxx",
//     },
//     Resource: "arn:aws:s3:::<>/*",
//     Sid: "1",
//   });
//   console.log("Added S3 bucket policies\n");
// }

// async function createMeta() {
//   const metaCollectionRef = db.collection("meta");

//   await metaCollectionRef.doc("ph_config").set({
//     currency: config.services.payhere.currency,
//     merchantId: config.services.payhere.merchantId,
//     merchantSecret: config.services.payhere.secret,
//   });
//   await metaCollectionRef.doc("ph_config_web").set({
//     currency: config.services.payhere.currency,
//     merchantId: config.services.payhere.merchantId,
//     merchantSecret: config.services.payhere.secret,
//   });
//   console.log("Added PayHere configuration\n");

//   await metaCollectionRef.doc("android_app").set({
//     version: 1,
//     createdAt: Timestamp.fromDate(moment().toDate()),
//     updatedAt: Timestamp.fromDate(moment().toDate()),
//   });
//   await metaCollectionRef.doc("huawei_app").set({
//     version: 1,
//     createdAt: Timestamp.fromDate(moment().toDate()),
//     updatedAt: Timestamp.fromDate(moment().toDate()),
//   });
//   await metaCollectionRef.doc("ios_app").set({
//     version: 1,
//     createdAt: Timestamp.fromDate(moment().toDate()),
//     updatedAt: Timestamp.fromDate(moment().toDate()),
//   });
//   console.log("Added App Version configuration\n");

//   await metaCollectionRef.doc("app_settings").set({
//     shouldShowExamAvailableSubjectsOnly: true,
//     shouldShowExamsForStudentGradeOnly: true,
//     shouldShowSubjectsForStudentGradeOnly: true,
//     showExamsInNextNoOfDays: 14,
//     createdAt: Timestamp.fromDate(moment().toDate()),
//     updatedAt: Timestamp.fromDate(moment().toDate()),
//   });
//   console.log("Added mobile app settings\n");

//   await metaCollectionRef.doc("payment_config").set({
//     checkUrl: "https://<>.amazonaws.com/<>/payments/checkForPayment",
//     notifyUrlApp: "https://<>.amazonaws.com/<>/payments/notifyPaymentApp",
//     notifyUrlWeb: "https://<>.amazonaws.com/<>/payments/notifyPaymentWeb",
//   });
//   console.log("Added AWS Payment URL settings\n");

//   await metaCollectionRef.doc("privacy_policy").set({
//     version: 1,
//     url: "https://<>.web.app/privacy_policy.md",
//     createdAt: Timestamp.fromDate(moment().toDate()),
//     updatedAt: Timestamp.fromDate(moment().toDate()),
//   });
//   await metaCollectionRef.doc("terms_and_conditions").set({
//     version: 1,
//     url: "https://<>.web.app/tos.md",
//     createdAt: Timestamp.fromDate(moment().toDate()),
//     updatedAt: Timestamp.fromDate(moment().toDate()),
//   });
//   console.log("Added Privacy and Terms and Conditions\n");
// }

// async function createMediums() {
//   const sinhala = {
//     name: "Sinhala",
//     createdAt: Timestamp.fromDate(moment().toDate()),
//   };
//   const english = {
//     name: "English",
//     createdAt: Timestamp.fromDate(moment().toDate()),
//   };
//   const tamil = {
//     name: "Tamil",
//     createdAt: Timestamp.fromDate(moment().toDate()),
//   };

//   if (initOldData) {
//     const promises: Promise<FirebaseFirestore.WriteResult>[] = [];
//     promises.push(createMediumWithUid("am8bdoD3wTAdwBeObJII", sinhala));
//     promises.push(createMediumWithUid("tAxqdR7E1Kk5OohEZ0AH", english));
//     promises.push(createMediumWithUid("ciJcriu6RWHGRFExHo0R", tamil));

//     await Promise.all(promises);
//   } else {
//     const promises: Promise<FirebaseFirestore.DocumentReference>[] = [];
//     promises.push(createMedium(sinhala));
//     promises.push(createMedium(english));
//     promises.push(createMedium(tamil));

//     await Promise.all(promises);
//   }

//   console.log(`Completed creating Mediums. Created 3 Mediums\n`);
// }

// async function createStreams() {
//   const arts = {
//     name: "Arts",
//     createdAt: Timestamp.fromDate(moment().toDate()),
//   };
//   const commerce = {
//     name: "Commerce",
//     createdAt: Timestamp.fromDate(moment().toDate()),
//   };
//   const mathematics = {
//     name: "Mathematics",
//     createdAt: Timestamp.fromDate(moment().toDate()),
//   };
//   const science = {
//     name: "Science",
//     createdAt: Timestamp.fromDate(moment().toDate()),
//   };
//   const technology = {
//     name: "Technology",
//     createdAt: Timestamp.fromDate(moment().toDate()),
//   };

//   if (initOldData) {
//     const promises: Promise<FirebaseFirestore.WriteResult>[] = [];
//     promises.push(createStreamWithUid("xaTePgXj9NfJQT2ugy2R", arts));
//     promises.push(createStreamWithUid("MjtKo4KAkFZrNjKQ3Jyp", commerce));
//     promises.push(createStreamWithUid("vm2w2t9glHdjifhGBnvD", mathematics));
//     promises.push(createStreamWithUid("pSn5ilAXGHeboVoQzeLZ", science));
//     promises.push(createStreamWithUid("L7JXT1xbLPF7yu4HuCUu", technology));

//     await Promise.all(promises);
//   } else {
//     const promises: Promise<FirebaseFirestore.DocumentReference>[] = [];
//     promises.push(createStream(arts));
//     promises.push(createStream(commerce));
//     promises.push(createStream(mathematics));
//     promises.push(createStream(science));
//     promises.push(createStream(technology));

//     await Promise.all(promises);
//   }

//   console.log(`Completed creating Streams. Created 5 Streams\n`);
// }

// async function createGrades() {
//   if (initOldData) {
//     await createOldGrades();
//   } else {
//     await createNewGrades();
//   }
// }

// async function createOldGrades() {
//   const now = moment();
//   const alGrades: FSGrade[] = [
//     {
//       uid: "cDqzlT4HBpnxAKj7CTpM",
//       index: 11,
//       name: "A/L 2020",
//       display: "A/L 2020",
//       active: true,
//       streamSelectable: true,
//       createdAt: Timestamp.fromDate(now.toDate()),
//     },
//     {
//       uid: "DD0UzuMXhzdvAPf0a2Jt",
//       index: 8,
//       name: "A/L 2021",
//       display: "A/L 2021",
//       active: true,
//       streamSelectable: true,
//       createdAt: Timestamp.fromDate(now.toDate()),
//     },
//     {
//       uid: "TVX6GmeplhG1l4Pj8NiX",
//       index: 9,
//       name: "A/L 2022",
//       display: "A/L 2022",
//       active: true,
//       streamSelectable: true,
//       createdAt: Timestamp.fromDate(now.toDate()),
//     },
//     {
//       uid: "TVX6GmeplhG1l4Pj8NiX",
//       index: 10,
//       name: "A/L 2023",
//       display: "A/L 2023",
//       active: true,
//       streamSelectable: true,
//       createdAt: Timestamp.fromDate(now.toDate()),
//     },
//   ];
//   const otherGrades: FSGrade[] = [
//     {
//       uid: "FbU7f9x0MwCRWxa1zf1l",
//       index: 1,
//       name: "O/L 2027",
//       display: "Grade 5",
//       active: true,
//       streamSelectable: false,
//       createdAt: Timestamp.fromDate(now.toDate()),
//     },
//     {
//       uid: "NinsbjEOV61MoD9cwuyf",
//       index: 2,
//       name: "O/L 2026",
//       display: "Grade 6",
//       active: true,
//       streamSelectable: false,
//       createdAt: Timestamp.fromDate(now.toDate()),
//     },
//     {
//       uid: "wBNcVVq9I5577AhxTw9O",
//       index: 3,
//       name: "O/L 2025",
//       display: "Grade 7",
//       active: true,
//       streamSelectable: false,
//       createdAt: Timestamp.fromDate(now.toDate()),
//     },
//     {
//       uid: "HOAfUB4LoTZb5Jmvt0K1",
//       index: 4,
//       name: "O/L 2024",
//       display: "Grade 8",
//       active: true,
//       streamSelectable: false,
//       createdAt: Timestamp.fromDate(now.toDate()),
//     },
//     {
//       uid: "AkBpFEcFKMBZ2Nglm00N",
//       index: 5,
//       name: "O/L 2023",
//       display: "Grade 9",
//       active: true,
//       streamSelectable: false,
//       createdAt: Timestamp.fromDate(now.toDate()),
//     },
//     {
//       uid: "HMAk4kIMebjMDq7puBYx",
//       index: 6,
//       name: "O/L 2022",
//       display: "Grade 10",
//       active: true,
//       streamSelectable: false,
//       createdAt: Timestamp.fromDate(now.toDate()),
//     },
//     {
//       uid: "bk1OwBnwBzkpj61amVbw",
//       index: 7,
//       name: "O/L 2021",
//       display: "Grade 11",
//       active: true,
//       streamSelectable: false,
//       createdAt: Timestamp.fromDate(now.toDate()),
//     },
//   ];

//   // create
//   const promises: Promise<FirebaseFirestore.WriteResult>[] = [];
//   for (var i = 0; i < otherGrades.length; i++) {
//     let grade = otherGrades[i];
//     promises.push(createGradeWithUid(grade.uid!, grade));
//   }
//   for (var j = 0; j < alGrades.length; j++) {
//     let grade = alGrades[j];
//     promises.push(createGradeWithUid(grade.uid!, grade));
//   }
//   await Promise.all(promises);

//   console.log(
//     `Completed creating Grades. Created ${
//       alGrades.length + otherGrades.length
//     } Grades\n`
//   );
// }

// async function createNewGrades() {
//   const now = moment();
//   let alGrades: any[] = [];
//   let olGrades: any[] = [];

//   // add A/L years
//   for (var i = 0; i < 3; i++) {
//     let alYear = now.year() + i;
//     let display = `${alYear} A/L`;
//     let bYear = alYear - 19;

//     alGrades.push({
//       bYear: bYear,
//       display: display,
//       name: display,
//       stream_selectable: true,
//     });
//   }

//   // add O/L years
//   for (var j = 0; j < 7; j++) {
//     let olYear = now.year() + j;
//     let name = `${olYear} O/L`;
//     let display = `Grade ${11 - j}`;
//     let bYear = olYear - 16;

//     olGrades.push({
//       bYear: bYear,
//       display: display,
//       name: name,
//       stream_selectable: false,
//     });
//   }

//   // map O/L
//   olGrades = olGrades.sort((a, b) => b.bYear - a.bYear);
//   let k = 1;
//   const finalOlGrades = olGrades.map((item) => {
//     return {
//       active: true,
//       display: item.display,
//       index: k++,
//       name: item.name,
//       stream_selectable: item.stream_selectable,
//     };
//   });

//   // map A/L
//   alGrades = alGrades.sort((a, b) => a.bYear - b.bYear);
//   let l = 8;
//   const finalAlGrades = alGrades.map((item) => {
//     return {
//       active: true,
//       display: item.display,
//       index: l++,
//       name: item.name,
//       stream_selectable: item.stream_selectable,
//     };
//   });

//   const finalGrades = finalOlGrades.concat(finalAlGrades);

//   const promises: Promise<FirebaseFirestore.DocumentReference>[] = [];
//   for (var m = 0; m < finalGrades.length; m++) {
//     let grade = finalGrades[m];
//     let gradefs = {
//       name: grade["name"],
//       display: grade["display"],
//       index: grade["index"],
//       active: grade["active"],
//       streamSelectable: grade["stream_selectable"],
//       createdAt: Timestamp.fromDate(moment().toDate()),
//     };
//     promises.push(createGrade(gradefs));
//   }
//   await Promise.all(promises);

//   console.log(
//     `Completed creating Grades. Created ${finalGrades.length} Grades\n`
//   );
// }

// async function createSubjects() {
//   let subjectData = [
//     {
//       name: "Biology",
//       gradesType: "AL",
//       icon: "biology.png",
//       medium: "Sinhala",
//       streams: ["Science"],
//     },
//     {
//       name: "Business Studies",
//       gradesType: "AL",
//       icon: "business.png",
//       medium: "Sinhala",
//       streams: ["Commerce"],
//     },
//     {
//       name: "Chemistry",
//       gradesType: "AL",
//       icon: "chemistry.png",
//       medium: "Sinhala",
//       streams: ["Science", "Mathematics"],
//     },
//     {
//       name: "Econ",
//       gradesType: "AL",
//       icon: "econ.png",
//       medium: "Sinhala",
//       streams: ["Commerce"],
//     },
//     {
//       name: "Engineering Technology",
//       gradesType: "AL",
//       icon: "engineering.png",
//       medium: "Sinhala",
//       streams: ["Technology"],
//     },
//     {
//       name: "English",
//       gradesType: "<AL",
//       icon: "english.png",
//       medium: "English",
//       streams: [],
//     },
//     {
//       name: "ICT",
//       gradesType: "OL",
//       icon: "it.png",
//       medium: "Sinhala",
//       streams: [],
//     },
//     {
//       name: "A/L ICT",
//       gradesType: "AL",
//       icon: "ict.png",
//       medium: "Sinhala",
//       streams: ["Technology", "Commerce", "Science", "Mathematics", "Arts"],
//     },
//     {
//       name: "Mathematics",
//       gradesType: "<AL",
//       icon: "maths.png",
//       medium: "Sinhala",
//       streams: [],
//     },
//     {
//       name: "Physics",
//       gradesType: "AL",
//       icon: "physics.png",
//       medium: "Sinhala",
//       streams: ["Science", "Mathematics"],
//     },
//     {
//       name: "Pure Maths",
//       gradesType: "AL",
//       icon: "pure-maths.png",
//       medium: "Sinhala",
//       streams: ["Mathematics"],
//     },
//     {
//       name: "SFT",
//       gradesType: "AL",
//       icon: "sft.png",
//       medium: "Sinhala",
//       streams: ["Technology"],
//     },
//     {
//       name: "Science",
//       gradesType: "<AL",
//       icon: "science.png",
//       medium: "Sinhala",
//       streams: [],
//     },
//   ];

//   // get grades
//   const grades: FSGrade[] = await getAllGrades();

//   // get streams
//   const streams: FSStream[] = await getAllStreams();

//   // upload icons and save subject
//   let imageUploadPromises: any[] = [];
//   let subjectSavePromises: any[] = [];
//   for (var i = 0; i < subjectData.length; i++) {
//     let subject = subjectData[i];

//     // image data
//     let localPath = `${__dirname}/../../../src/subject_icons/${subject.icon}`;
//     let destinationPath = `subject-icons/${subject.icon}`;
//     let iconUrl = `https://storage.googleapis.com/${config.firebase.projectId}.appspot.com/${destinationPath}`;

//     let imageUploadPromise = bucket.upload(localPath, {
//       gzip: true,
//       public: true,
//       destination: destinationPath,
//       metadata: {
//         // Enable long-lived HTTP caching headers
//         // Use only if the contents of the file will never change
//         // (If the contents will change, use cacheControl: 'no-cache')
//         cacheControl: "public, max-age=31536000",
//         contentType: "image/png",
//       },
//     });
//     imageUploadPromises.push(imageUploadPromise);

//     // save subject
//     let gradeIds: string[] = getGradeIdsByGradeType(grades, subject.gradesType);
//     let streamMap: any = getStreamMapByStreamNames(streams, subject.streams);

//     subjectSavePromises.push(
//       createSubject({
//         name: subject.name,
//         medium: subject.medium,
//         image: iconUrl,
//         grades: gradeIds,
//         streams: streamMap,
//         createdAt: Timestamp.fromDate(moment().toDate()),
//       })
//     );
//   }

//   // wait
//   console.log(`Waiting till subject icons are uploaded`);
//   await Promise.all(imageUploadPromises);
//   console.log(`All subject icons were uploaded`);

//   await Promise.all(subjectSavePromises);
//   console.log(
//     `Subject saving completed. ${subjectData.length} subjects added!\n`
//   );
// }

// function getGradeIdsByGradeType(
//   grades: FSGrade[],
//   gradeType: string
// ): string[] {
//   let filteredGrades: FSGrade[] = [];

//   if (gradeType === "AL") {
//     filteredGrades = grades.filter((item) => item.name.includes("A/L"));
//   } else if (gradeType === "<AL") {
//     filteredGrades = grades.filter((item) => item.name.includes("O/L"));
//   } else if (gradeType === "OL") {
//     let currentYear = moment().year();
//     filteredGrades = grades.filter(
//       (item) =>
//         item.name === `${currentYear} O/L` ||
//         item.name === `${currentYear + 1} O/L`
//     );
//   }

//   return filteredGrades.map((item) => item.uid!);
// }

// function getStreamMapByStreamNames(
//   streams: FSStream[],
//   streamNames: string[]
// ): any {
//   let filteredStreams: FSStream[] = streams.filter((item) =>
//     streamNames.includes(item.name)
//   );

//   let streamMap: any = {};
//   for (var i = 0; i < filteredStreams.length; i++) {
//     let stream = filteredStreams[i];
//     streamMap[stream.uid!] = stream.name;
//   }
//   return streamMap;
// }
