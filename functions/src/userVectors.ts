import {attributesToVector,
  preferencesToVector} from "../../utilities/vectorUtils";
import functions = require("firebase-functions");

export const addUserVectors = functions.firestore
  .document("users/{userId}")
  .onCreate(async (snapshot: { data: () => any; ref: { update: (arg0:
    { attributesVector: number[]; preferencesVector: number[]; }) => any; }; },
  context: any) => {
    const userData = snapshot.data();

    // Assuming your Typeform data has a consistent structure
    // Extract attributes and preferences
    const userAttributes = {
      date: userData.answers[4].date,
      nationalityIndex: 0, // map from choice to index
      height: userData.answers[6].number,
      introExtroScale: userData.answers[19].number,
      ambitionScale: userData.answers[20].number,
    };

    const userPreferences = {
      introExtroAttraction: userData.answers[21].number,
      heightImportance: userData.answers[22].number,
      ambitionImportance: userData.answers[23].number,
      desiredAgeRangeStart: userData.answers[24].number,
      desiredAgeRangeEnd: userData.answers[25].number,
    };

    // Convert the attributes and preferences to vectors
    const attributesVector = attributesToVector(userAttributes);
    const preferencesVector = preferencesToVector(userPreferences);

    // Update the Firestore document with the vectors
    return snapshot.ref.update({
      attributesVector: attributesVector,
      preferencesVector: preferencesVector,
    });
  });
