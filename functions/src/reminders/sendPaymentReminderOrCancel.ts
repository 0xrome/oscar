import * as admin from 'firebase-admin';
import * as moment from 'moment';
import axios from 'axios';

import db from '../utils/db';

export const sendPaymentReminder = async () => {
  const now = admin.firestore.Timestamp.now();
  const twentyFourHoursAgo = moment(now.toDate()).subtract(24, 'hours').toDate();

    // TODO: Make sure that paymentLinkSentAt or similar + status is indexed in the relevant Matches document when payment link is sent
    // TODO: Add reminderSent field to Matches document
  const matchQuery = await db.collection('Matches')
    .where('paymentLinkSentAt', '<=', twentyFourHoursAgo)
    .where('status', '==', 'pending')
    .where('reminderSent', '==', false) // Only select matches where a reminder hasn't been sent
    .get();

  matchQuery.docs.forEach(async (doc) => {
    const match = doc.data();
    const { phoneNumber, paymentLink } = match;

    // Send a reminder if the payment is still pending after 24 hours
    await sendWhatsappMessage(phoneNumber, `Please complete your payment at ${paymentLink}`);


    // Update the document to indicate that a reminder has been sent
    await db.collection('Matches').doc(doc.id).update({ reminderSent: true });
  });
}

export const cancelUnpaidDates = async () => {
  const now = admin.firestore.Timestamp.now();
  const fortyEightHoursAgo = moment(now.toDate()).subtract(48, 'hours').toDate();

  const matchQuery = await db.collection('Matches')
    .where('paymentLinkSentAt', '<=', fortyEightHoursAgo)
    .where('status', '==', 'pending')
    .get();

  matchQuery.docs.forEach(async (doc) => {
    const match = doc.data();
    const { userAEmail, userBEmail } = match;

    // Cancel the date if the payment is still pending after 48 hours
    await db.collection('Matches').doc(doc.id).update({ status: 'cancelled' });
    await sendCancellationEmail(userAEmail, userBEmail); // Send cancellation emails to both users
  });
}

  
// TODO: Build whatsapp message, try and use utility function
  const sendWhatsappMessage = async (phoneNumber: string, message: string) => {
    const requestBody = {
      phone: phoneNumber,
      body: message,
    };
    await axios.post('https://api.whatsapp.com/send', requestBody);
  };

  // TODO: Build email, try and use utility function
  const sendCancellationEmail = async (userAEmail: string, userBEmail: string) => {
    // Send cancellation email to both users
  }