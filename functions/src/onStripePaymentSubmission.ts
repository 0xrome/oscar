import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import Stripe from 'stripe';
import axios from 'axios';

import { sendWhatsappMessageToBar } from './utils/sendWhatsappMessageToBar';

const stripe = new Stripe('your-stripe-secret-key', { apiVersion: '2020-08-27' });

export const onStripePaymentSubmission = functions.https.onRequest(async (req, res) => {
  const sig = req.headers['stripe-signature'];

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.rawBody, sig, 'your-stripe-webhook-secret');
  } catch (err: any) {
    res.status(400).send(`Webhook Error: ${err.message}`);
    return;
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;

    // Retrieve the Match document using the session ID
    const matchSnapshot = await admin.firestore().collection('Matches').doc(session.id).get();
    const matchData = matchSnapshot.data();

    if (matchData) {
      // Update the payment status for the user to 'paid'
      const userPaymentStatusField = matchData.userAPayment === session.id ? 'userAPaymentStatus' : 'userBPaymentStatus';
      await matchSnapshot.ref.update({ [userPaymentStatusField]: 'paid' });

      // Check if the other user has paid
      const otherUserPaymentStatusField = userPaymentStatusField === 'userAPaymentStatus' ? 'userBPaymentStatus' : 'userAPaymentStatus';
      const otherUserPaymentStatus = matchData[otherUserPaymentStatusField];

      if (otherUserPaymentStatus !== 'paid') {
        // If the other user hasn't paid, send an email to the user that has just paid
        const userEmail = userPaymentStatusField === 'userAPaymentStatus' ? matchData.userAEmail : matchData.userBEmail;
        await sendPaymentConfirmationEmail(userEmail);
      } else {
        // If the other user has paid, update the date's status and send a Whatsapp message to the bar
        await matchSnapshot.ref.update({ dateStatus: 'confirmed' });
        await sendWhatsappMessageToBar(matchData.matchDate);
      }
    }
  }

  res.json({ received: true });
});

async function sendPaymentConfirmationEmail(email: string) {
    const message = {
      from_email: 'your-email@example.com',
      subject: 'Thank You for Your Payment',
      text: 'Thank you for your payment. We are currently waiting on the other user to complete their payment.',
      to: [
        {
          email: email,
          type: 'to',
        },
      ],
    };
  
    try {
      const response = await client.messages.send({ message });
      console.log(`Payment confirmation email sent to ${email}: ${response}`);
    } catch (error) {
      console.error(`Failed to send payment confirmation email to ${email}: ${error}`);
      throw error; // Re-throw the error so it can be caught and handled by the calling function
    }
  }