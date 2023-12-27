import axios from 'axios';
import db from './utils/db';
import * as functions from 'firebase-functions';

export const onTagChange = functions.https.onRequest(async (req, res) => {
  // TODO: Adjust this line based on the structure of your webhook data
  const newTags = req.body.data.merges.TAGS.split(',');
  const email = req.body.data.email;

  const userSnapshot = await db.collection('Users').where('email', '==', email).get();
  const userDoc = userSnapshot.docs[0];
  const userData = userDoc.data();

  const oldTags = userData.tags || [];
  const addedTags = newTags.filter((tag: any) => !oldTags.includes(tag));
  const removedTags = oldTags.filter((tag: any) => !newTags.includes(tag));
  // TODO: Add logic to handle removed tags
  // TODO: add logic for other tags
  for (const tag of addedTags) {
    if (tag.startsWith('rating_')) {
      const rating = parseInt(tag.split('_')[1]);
      if (rating >= 7) {
        await sendThankYouEmail(email);
      }
      // TODO: Replace 'date_cancellation' with the actual tag for date cancellations
    } else if (tag === 'date_cancellation') {
      await processDateCancellationWebhook(email, userDoc);
    } else if (tag === 'some_other_tag') {
      // await handleOtherTag(email);
    }
  }

  await db.collection('Users').doc(userDoc.id).update({ tags: newTags });

  res.sendStatus(200);
});

async function processDateCancellationWebhook(email: string, userDoc: FirebaseFirestore.QueryDocumentSnapshot<FirebaseFirestore.DocumentData>) {
  // If the date is cancelled, send a cancellation message
  // TODO: get the match ID from the user document
  const matchId = userDoc.data().id; // Replace with the correct field name for the match ID
  const matchDoc = await db.collection('Matches').doc(matchId).get();
  const match = matchDoc.data();

  // TODO: See if there's a better way to do this with the WA API
  const cancellationMessage = `The date scheduled at ${match.location} on ${match.date.toDate()} has been cancelled.`;
  await sendWhatsappMessage(match.userAPhone, cancellationMessage);
  await sendWhatsappMessage(match.userBPhone, cancellationMessage);
  await sendWhatsappMessage(match.barPhone, cancellationMessage);

  // Update the match status to 'cancelled'
  await db.collection('Matches').doc(matchId).update({ status: 'cancelled' });

  // Implement a short term ban for the user who cancelled
  // TODO: Make sure banned status is taken into account when matching
  // TODO: Finish implenting ban logic
  const userId = userDoc.id;
  await db.collection('Users').doc(userId).update({ status: 'banned', banEndDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) }); // 1 week ban
}

// TODO: Update to use WA utiltiy function if possible
const sendWhatsappMessage = async (phoneNumber: string, message: string) => {
  const requestBody = {
    phone: phoneNumber,
    body: message,
  };
  // TODO: Add API endpoint
  await axios.post('https://api.whatsapp.com/send', requestBody);
};

// TODO: Update to use mailchimp utiltiy function if possible
async function sendThankYouEmail(email: string) {
  const message = {
    from_email: 'your-email@example.com', // Replace with your email
    to: [{ email: email }],
    subject: 'Thank you for your rating!',
    text: 'We appreciate your feedback. If you enjoyed our service, please refer us to your friends.',
    html: '<p>We appreciate your feedback. If you enjoyed our service, please <a href="http://example.com/referral">refer us to your friends</a>.</p>', // Replace with your referral link
  };

  const requestBody = {
    key: 'your-mailchimp-api-key', // Replace with your Mailchimp API key
    message: message,
  };

  await axios.post('https://mandrillapp.com/api/1.0/messages/send.json', requestBody);
}