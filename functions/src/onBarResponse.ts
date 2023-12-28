import { sendWhatsappMessageToBar } from './utils/sendWhatsappMessageToBar';
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
// import mailchimp from '@mailchimp/mailchimp_transactional';

// TODO: Update naming to be more clear
export const onBarResponse = functions.https.onRequest(async (req, res) => {
    const messages = req.body.messages;
    // TODO: Update Whatsapp logic based on Whatsapp API access
    for (const message of messages) {
      if (message.from === 'bar-phone-number' && message.type === 'text') {
          const matchId = message.matchId; // The ID of the Match document, which should be included in the message from the bar
          const matchRef = admin.firestore().collection('Matches').doc(matchId);
          const matchSnapshot = await matchRef.get();
      if (!matchSnapshot.exists) {
          console.error(`Match with ID ${matchId} does not exist`);
          continue; // Skip this iteration of the loop
      }
      const matchData = matchSnapshot.data() as any; // We can assert that matchData is defined because we've checked that the document exists

      if (message.text === 'yes') {
          // If the bar responds with 'yes', update the date's status to confirmed
          await matchRef.update({ dateStatus: 'confirmed' });

          // then send a Mailchimp transactional email with location details to both users
          await sendLocationDetailsEmail(matchData.userAEmail, matchData.location);
          await sendLocationDetailsEmail(matchData.userBEmail, matchData.location);
      } else if (message.text === 'no') {
          // If the bar responds with 'no', ask another bar
          const nextBar = getNextBar(); // A function that returns the next bar to ask
          await sendWhatsappMessageToBar(await nextBar, matchData.matchDate);
      }
            } 
    }
  
    res.sendStatus(200);
  });

  // TODO: Build email, try and use utility function
  async function sendLocationDetailsEmail(email: string, location: string) {
    // const message = {
    //   from_email: 'your-email@example.com',
    //   subject: 'Location Details for Your Date',
    //   text: `Your date will be at ${location}. Please arrive on time.`,
    //   to: [
    //     {
    //       email: email,
    //       type: 'to',
    //     },
    //   ],
    // };
  
    try {
      // const response = await client.messages.send({ message });
      // console.log(`Location details email sent to ${email}: ${response}`);
    } catch (error) {
      // console.error(`Failed to send location details email to ${email}: ${error}`);
      throw error; // Re-throw the error so it can be caught and handled by the calling function
    }
  }

  async function getNextBar() {
    const barsSnapshot = await admin.firestore().collection('Bars').get();
    const bars = barsSnapshot.docs.map(doc => doc.data());
  
    // TODO: Build bars Collection
    // TODO: Create logic to determine the next bar
    // This example simply returns the first bar in the collection
    // Replace this with your actual logic to determine the next bar
    // Do we want it to return a random bar? Or the next bar in the list?
    // What object are we returning, is a number just enough?
    const nextBar = bars[0].toString();
  
    return nextBar;
  }