/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

// import {onRequest} from "firebase-functions/v2/https";
// import * as logger from "firebase-functions/logger";

// Start writing functions
// https://firebase.google.com/docs/functions/typescript

// export const helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

import functions = require("firebase-functions");
import express = require("express");
import bodyParser = require("body-parser");
import admin = require("firebase-admin");

admin.initializeApp();
const app = express();

// Use body-parser middleware to parse the incoming JSON
app.use(bodyParser.json());

app.post("/typeform-webhook", async (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  req: { body: any; }, res: { sendStatus: (arg0: number) => void; }) => {
  const formResponse = req.body;

  // Ensure it's a valid Typeform payload
  if (formResponse && formResponse.form_response) {
    // Store the data in Firebase
    const db = admin.firestore();
    const docRef = db.collection("typeformResponses").doc();
    await docRef.set(formResponse.form_response);
  }

  // Send a response to acknowledge receipt of the data
  res.sendStatus(200);
});

exports.typeformWebhook = functions.https.onRequest(app);
