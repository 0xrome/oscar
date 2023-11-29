import * as serviceAccount from "../serviceAccountKey.json";
import * as admin from 'firebase-admin';

import { ServiceAccount } from "firebase-admin";
let db: any;
// import { collection, getDocs } from 'firebase/firestore';
import { getFirestore, CollectionGroup } from 'firebase-admin/firestore';

interface TypeformResponse {
  answers: {
    type: string;
    text: string;
  }[];
  attributesVector?: number[]; // Made optional as per your request
  definition: {
    endings: {
      id: string;
      ref: string;
    }[];
  };
  ending: {
    id: string;
    ref: string;
  };
  form_id: string;
  landed_at: string;
  preferencesVector?: number[]; // Made optional as per your request
  submitted_at: string;
  token: string;
}

export async function fetchUserVectors() {
  db = getFirestore(admin.app());
  console.log("db: ", db);

  const typeformResponsesCol = db.collection('typeformResponses');
  console.log("Typeform responsesCol: ", typeformResponsesCol);
  // Now you can use the collection reference
  const querySnapshot = await typeformResponsesCol.get();
  console.log("Query Snapshot: ", querySnapshot);
  const userVectors: { id: any; attributesVector: any; preferencesVector: any; }[] = [];

  querySnapshot.forEach((doc: { data: () => any; id: any; }) => {
    const data = doc.data();
    userVectors.push({
      id: doc.id,
      attributesVector: data.attributesVector,
      preferencesVector: data.preferencesVector,
    });
  });
  console.log("fetchUserVectors() userVectors:", userVectors);

  return userVectors;
}

