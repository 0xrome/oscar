import { sendWhatsappMessageToBar } from './utils/sendWhatsappMessageToBar';

export const whatsappWebhook = functions.https.onRequest(async (req, res) => {
    const messages = req.body.messages;
  
    for (const message of messages) {
      if (message.from === 'bar-phone-number' && message.type === 'text') {
        if (message.text === 'yes') {
            // If the bar responds with 'yes', update the date's status to confirmed
            await matchRef.update({ dateStatus: 'confirmed' });

            // then send a Mailchimp transactional email with location details to both users
            const matchId = message.matchId; // The ID of the Match document, which should be included in the message from the bar
            const matchSnapshot = await admin.firestore().collection('Matches').doc(matchId).get();
            const matchData = matchSnapshot.data();
        
            if (matchData) {
              await sendLocationDetailsEmail(matchData.userAEmail, matchData.location);
              await sendLocationDetailsEmail(matchData.userBEmail, matchData.location);
            }
          } else if (message.text === 'no') {
            // If the bar responds with 'no', ask another bar
            const nextBar = getNextBar(); // A function that returns the next bar to ask
            await sendWhatsappMessageToBar(nextBar, message.matchDate);
          }
      }
    }
  
    res.sendStatus(200);
  });


  async function sendLocationDetailsEmail(email: string, location: string) {
    const message = {
      from_email: 'your-email@example.com',
      subject: 'Location Details for Your Date',
      text: `Your date will be at ${location}. Please arrive on time.`,
      to: [
        {
          email: email,
          type: 'to',
        },
      ],
    };
  
    try {
      const response = await client.messages.send({ message });
      console.log(`Location details email sent to ${email}: ${response}`);
    } catch (error) {
      console.error(`Failed to send location details email to ${email}: ${error}`);
      throw error; // Re-throw the error so it can be caught and handled by the calling function
    }
  }

  async function getNextBar() {
    const barsSnapshot = await admin.firestore().collection('Bars').get();
    const bars = barsSnapshot.docs.map(doc => doc.data());
  
    // TODO: Logic to determine the next bar
    // This example simply returns the first bar in the collection
    // Replace this with your actual logic to determine the next bar
    const nextBar = bars[0];
  
    return nextBar;
  }