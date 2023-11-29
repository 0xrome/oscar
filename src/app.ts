import * as serviceAccount from "./serviceAccountKey.json";
import * as admin from 'firebase-admin';
import * as dotenv from 'dotenv';
import { ServiceAccount } from "firebase-admin";

dotenv.config();

var express = require('express');
var bodyParser = require('body-parser');
var cors = require('cors');

const fs = require('fs');
const path = require('path');

const { createAndSaveIndex, searchNearestNeighbors } = require("./hnswlib/queryNearestNeighbour");

const app = express();

// Use middleware
app.use(cors());
app.use(bodyParser.json());

// Directory path where the index files will be saved
const indexDirectoryPath = path.join(__dirname, '..', 'data');

// Check if the directory exists, if not, create it
if (!fs.existsSync(indexDirectoryPath)) {
    fs.mkdirSync(indexDirectoryPath, { recursive: true });
}

// Start the server
const PORT = process.env.PORT || 3000;

function initialise() {
  return new Promise<void>((resolve, reject) => {
    console.log("initialising firebase...");
    try {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount as ServiceAccount),
        databaseURL: "https://oscar-da63e-default-rtdb.europe-west1.firebasedatabase.app"
      });
      resolve();
    } catch (error) {
      console.error("Error initializing Firebase Admin SDK:", error);
      reject(error);
    }
  });
}

initialise().then(() => {
    // // Create and save the index
createAndSaveIndex().then(() => {
  console.log('Index created and saved successfully.');
  // Only start listening on the express server once the index has been created
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
}).catch((error: any) => {
  console.error('Failed to create index:', error);
  process.exit(1); // Exit if we cannot create the index
});
});
  



app.post('/api/query-nearest-neighbour', async (req: { body: { combinedVector: any; }; }, res: { json: (arg0: { neighbors: any; }) => void; status: (arg0: number) => { (): any; new(): any; send: { (arg0: string): void; new(): any; }; }; }) => {
  console.log('Start queryNearestNeighbour API call');
  console.log("Request body:", req.body);
  const { combinedVector } = req.body;
    console.log("combined vector: ", combinedVector);
  try {
    const neighbors = searchNearestNeighbors(combinedVector, 10);
    res.json({ neighbors });
  } catch (error) {
    console.error("queryNearestNeighbour API call", error);
    res.status(500).send('Internal Server Error');
  }
});


export {}