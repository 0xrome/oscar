import {attributesToVector,
  preferencesToVector} from "../utilities/vectorUtils";
import functions = require("firebase-functions");
import admin = require("firebase-admin");

// Adjust the path to the correct location of updateUserIndex.ts
// import {updateUserIndex} from "../../shared/annoy/updateUserIndex";

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  admin.initializeApp();
}

// TODO: Build out tests
export const addUserVectors = functions.firestore
  .document("typeformResponses/{userId}")
  .onCreate(async (snapshot: { data: () => any; ref: { update: (arg0:
    { attributesVector: number[]; preferencesVector: number[]; }) => any; }; },
  context: any) => {
    const userData = snapshot.data();
    console.log("User Data:", userData);


    // TODO: Convert more of the user's attributes and preferences to vectors using the `attributesToVector` and `preferencesToVector` functions
    // Assuming your Typeform data has a consistent structure
    // Extract attributes and preferences
    // typeform responses are i+2 the answers array (ISH!)
    // e.g. typeform question 32 = answers[30]
    const userAttributes = {
      date: userData.answers[4].date,
      nationalityIndex: 0, // map from choice to index
      height: userData.answers[6].number,
      introExtroScale: userData.answers[19].number,
      ambitionScale: userData.answers[20].number,
    };
    console.log("User Attributes:", userAttributes);


    const userPreferences = {
      introExtroAttraction: userData.answers[31].number,
      heightImportance: userData.answers[37].number,
      ambitionImportance: userData.answers[39].number,
    //   desiredAgeRangeStart: userData.answers[24].number,
    //   desiredAgeRangeEnd: userData.answers[30].labels.first,
    };
    console.log("User Preferences:", userPreferences);


    // Convert the attributes and preferences to vectors
    const attributesVector = attributesToVector(userAttributes);
    const preferencesVector = preferencesToVector(userPreferences);

    console.log("Attributes Vector:", attributesVector);
    console.log("Preferences Vector:", preferencesVector);

    // Update the Firestore document with the vectors
    await snapshot.ref.update({
      attributesVector: attributesVector,
      preferencesVector: preferencesVector,
    });

    // Call updateUserIndex once Firestore update is done
    // console.log("calling updateUserIndex...");
    // updateUserIndex(context.params.userId, attributesVector, preferencesVector);
  });
