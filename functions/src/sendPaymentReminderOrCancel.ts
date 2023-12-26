import * as admin from 'firebase-admin';
import * as moment from 'moment';
import axios from 'axios';

import db from './utils/db';

export const sendPaymentReminderOrCancel = async () => {
    const now = admin.firestore.Timestamp.now();
    const twentyFourHoursAgo = moment(now.toDate()).subtract(24, 'hours').toDate();
    const fortyEightHoursAgo = moment(now.toDate()).subtract(48, 'hours').toDate();
  
    const paymentQuery = await db.collection('Payments')
      .where('paymentLinkSentAt', '>', fortyEightHoursAgo)
      .where('paymentLinkSentAt', '<=', twentyFourHoursAgo)
      .where('status', '==', 'pending')
      .get();
  
    paymentQuery.docs.forEach(async (doc) => {
      const payment = doc.data();
      const { phoneNumber, paymentLink } = payment;
  
      if (moment(payment.paymentLinkSentAt.toDate()).isBefore(fortyEightHoursAgo)) {
        // Cancel the date if the payment is still pending after 48 hours
        await db.collection('Dates').doc(payment.dateId).update({ status: 'cancelled' });
        await sendWhatsappMessage(phoneNumber, 'Your date has been cancelled due to non-payment.');
      } else {
        // Send a reminder if the payment is still pending after 24 hours
        await sendWhatsappMessage(phoneNumber, `Please complete your payment at ${paymentLink}`);
      }
    });
  }
  
  const sendWhatsappMessage = async (phoneNumber: string, message: string) => {
    const requestBody = {
      phone: phoneNumber,
      body: message,
    };
    await axios.post('https://api.whatsapp.com/send', requestBody);
  };