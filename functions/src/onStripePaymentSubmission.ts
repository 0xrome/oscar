import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
// import Stripe from 'stripe';
// import axios from 'axios';

import { sendWhatsappMessageToBar } from './utils/sendWhatsappMessageToBar';

// TODO: Sort out Stripe API credentials
// TODO: Create webhook in Stripe dashboard and add the endpoint URL
// TODO: Firebase function response alwats{ received: true }, update to reflect the actual response
// const stripe = new Stripe('your-stripe-secret-key');

export const onStripePaymentSubmission = functions.https.onRequest(async (req, res) => {
  // const sig = req.headers['stripe-signature'];

  // let event;

  // try {
  //   event = stripe.webhooks.constructEvent(req.rawBody, sig, 'your-stripe-webhook-secret');
  // } catch (err: any) {
  //   res.status(400).send(`Webhook Error: ${err.message}`);
  //   return;
  // }

  // if (event.type === 'checkout.session.completed') {
  //   const session = event.data.object;

  if(true) {
    const session = req.body;
    // TODO: Ensure that there are sessionIDs or similar field in the Match document, if not, create a connection between the two
    // TODO: Ensure there are userAPayment and userBPayment fields in the Match document
    // TODO: Handle the case where the session ID doesn't match any documents in the Matches collection
    // Query the Matches collection to find the document with the corresponding session ID
    const userAPaymentSnapshot = await admin.firestore().collection('Matches')
    .where('userAPayment', '==', session.id)
    .get();

    const userBPaymentSnapshot = await admin.firestore().collection('Matches')
    .where('userBPayment', '==', session.id)
    .get();

    let matchDoc;
    if (!userAPaymentSnapshot.empty) {
      matchDoc = userAPaymentSnapshot.docs[0];
    } else if (!userBPaymentSnapshot.empty) {
      matchDoc = userBPaymentSnapshot.docs[0];
    }

    // TODO: Handle the case where the session ID doesn't match any documents in the Matches collection
    // TODO: Extensively test payment status updates
    if (matchDoc) {
      const matchData = matchDoc.data();

      // Update the payment status for the user to 'paid'
      const userPaymentStatusField = matchData.userAPayment === session.id ? 'userAPaymentStatus' : 'userBPaymentStatus';
      await matchDoc.ref.update({ [userPaymentStatusField]: 'paid' });

      // Check if the other user has paid
      const otherUserPaymentStatusField = userPaymentStatusField === 'userAPaymentStatus' ? 'userBPaymentStatus' : 'userAPaymentStatus';
      const otherUserPaymentStatus = matchData[otherUserPaymentStatusField];

      // Send an email to the user that has just paid
      const userEmail = userPaymentStatusField === 'userAPaymentStatus' ? matchData.userAEmail : matchData.userBEmail;
      await sendPaymentConfirmationEmail(userEmail);

      if (otherUserPaymentStatus === 'paid') {
        // If the other user has paid, update the date's status and send a Whatsapp message to the bar
        await matchDoc.ref.update({ dateStatus: 'confirmed' });
        await sendWhatsappMessageToBar("number or object of bar", matchData.matchDate);
      }
    }
  }

  res.json({ received: true });
});

// TODO: Build email, try and use utility function
async function sendPaymentConfirmationEmail(email: string) {
    // const message = {
    //   from_email: 'your-email@example.com',
    //   subject: 'Thank You for Your Payment',
    //   text: 'Thank you for your payment. We are currently waiting on the other user to complete their payment.',
    //   to: [
    //     {
    //       email: email,
    //       type: 'to',
    //     },
    //   ],
    // };
  
    // try {
    //   // const response = await client.messages.send({ message });
    //   const response = "hello";
    //   console.log(`Payment confirmation email sent to ${email}: ${response}`);
    // } catch (error) {
    //   console.error(`Failed to send payment confirmation email to ${email}: ${error}`);
    //   throw error; // Re-throw the error so it can be caught and handled by the calling function
    // }
  }