import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import admin from 'firebase-admin';

// Initialize environment variables from .env file
dotenv.config();

// Note: Initialize the app only once. If you have initialized elsewhere, 
// remove it here.
admin.initializeApp();
const app = express();

// Use middleware
app.use(cors());
app.use(bodyParser.json());

// Define a route
app.get('/', (req, res) => {
  res.send('Hello, world!');
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});