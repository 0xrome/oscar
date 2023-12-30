const express = require('express');
const bodyParser = require('body-parser');
import * as functions from 'firebase-functions';

const app = express();

app.use(bodyParser.json());

// Handle GET request for webhook verification
app.get('/webhook', (req: any, res: any) => {
  console.log('GET request received');
  // Your Verify Token should be a secret string
  const VERIFY_TOKEN = 'EAANJVZBZCZAlKIBO677XSrp6GZBqTVZBBxRKnUkg9X8bvnCwtkBwa7DIbD4MYVYhGeynOEBfz0Q3HRG5tzZBFQjd6p7odW81tCEOGdg5TJBjuHsollkj0nfzD8ZBIntzAB5tNSiVnmrAd8kSeFesBogGFMwWNdH7ZAcA8uFQ0wMJqqbJcN68nw5mcEZCd2MXfzBRbCAVDZAa8i0L8TNPavqOD5w8lFZCOsZD';

  // Parse the query params
  let mode = req.query['hub.mode'];
  let token = req.query['hub.verify_token'];
  let challenge = req.query['hub.challenge'];

  // Checks the mode and token sent are correct
  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    // Responds with the challenge token from the request
    console.log('WEBHOOK_VERIFIED');
    res.status(200).send(challenge);
  } else {
    // Responds with '403 Forbidden' if verify tokens do not match
    res.sendStatus(403);
  }
});

// Define the function
export const whatsappWebhook = functions.https.onRequest(app);