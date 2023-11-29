"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const serviceAccount = __importStar(require("./serviceAccountKey.json"));
const admin = __importStar(require("firebase-admin"));
const dotenv = __importStar(require("dotenv"));
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
    return new Promise((resolve, reject) => {
        console.log("initialising firebase...");
        try {
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount),
                databaseURL: "https://oscar-da63e-default-rtdb.europe-west1.firebasedatabase.app"
            });
            resolve();
        }
        catch (error) {
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
    }).catch((error) => {
        console.error('Failed to create index:', error);
        process.exit(1); // Exit if we cannot create the index
    });
});
app.post('/api/query-nearest-neighbour', async (req, res) => {
    console.log('Start queryNearestNeighbour API call');
    console.log("Request body:", req.body);
    const { combinedVector } = req.body;
    console.log("combined vector: ", combinedVector);
    try {
        const neighbors = searchNearestNeighbors(combinedVector, 10);
        res.json({ neighbors });
    }
    catch (error) {
        console.error("queryNearestNeighbour API call", error);
        res.status(500).send('Internal Server Error');
    }
});
