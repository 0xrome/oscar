import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import mailchimp from '@mailchimp/mailchimp_transactional';
import * as Stripe from 'stripe';

import db from './utils/db';


const client = mailchimp.createClient({
    key: 'your-mailchimp-api-key',
});

const stripe = new Stripe(functions.config().stripe.secret, {
    apiVersion: '2020-08-27',
  });

  // TODO: Build tests
export const onSurveySubmit = functions.https.onRequest(async (req, res) => {
    // Parse the request body
    const email = req.body.form_response.hidden.email;
    const responses = req.body.form_response.answers;

    // Query for the Match document that corresponds to the user
    const matchDoc = await db.collection('Matches')
                            .where('status', '==', 'proposed')
                            .where(admin.firestore.FieldPath.documentId(), 'in', [email])
                            .get();

    // If no match found, return an error
    if (matchDoc.empty) {
        res.status(404).send('No match found for this user.');
        return;
    }

    // Get the first match document
    const match = matchDoc.docs[0];
    const matchData = match.data();

    // Determine which user filled out the survey
    const isUserA = matchData.userAEmail === email;
    const userField = isUserA ? 'userAAvailability' : 'userBAvailability';
    const otherUserField = isUserA ? 'userBAvailability' : 'userAAvailability';

    // Update the status field and availability based on the survey responses
    // TODO: Change availability logic to match the survey response (multiple availabilities possible)
    const availability = responses[1].text;

    if (availability === 'None of these dates') {
        // Cancel the match
        await match.ref.update({ status: 'cancelled' });

        // Send cancellation emails
        const otherUserEmail = isUserA ? matchData.userBEmail : matchData.userAEmail;
        await sendCancellationEmail(email);
        await sendCancellationEmail(otherUserEmail);

        res.status(200).send('Match cancelled.');
    } else {
        // TODO: Change availability logic to match the survey response (multiple availabilities possible)
        const status = responses[0].text; // Replace with actual logic
        await match.ref.update({ status, [userField]: availability });

        // If the other user's availability is not filled out, end the function call
        if (!matchData[otherUserField]) {
            res.status(200).send('Availability updated for the current user. Waiting for the other user.');
            return;
        }

       // Compare the availabilities of both users
       const matchingDates = getMatchingDates(availability, matchData[otherUserField]);

        if (matchingDates.length > 0) {
            // If there's a match, update the match document with the earliest matching date
            // TODO: Check to see if sorting logic is correct and if there's a better way to do it
            matchingDates.sort((a: { getTime: () => number; }, b: { getTime: () => number; }) => a.getTime() - b.getTime());
            const matchDate = matchingDates[0];

            try {
                // Call createStripePaymentLink and store the returned Stripe payment link in the Matches document
                const userPaymentField = isUserA ? 'userAPayment' : 'userBPayment';
                const stripePayment = await createStripePaymentLink(match.ref, userPaymentField);
                await match.ref.update({ status: 'matched', matchDate, stripePayment });

                 // Send payment link email to both users
                await sendPaymentLinkEmail(matchData.userAEmail, stripePayment);
                console.log(`Payment link email sent to ${matchData.userAEmail}`);
                await sendPaymentLinkEmail(matchData.userBEmail, stripePayment);
                console.log(`Payment link email sent to ${matchData.userBEmail}`);

                // Update the payment status for each user to 'pending'
                const userPaymentStatusField = isUserA ? 'userAPaymentStatus' : 'userBPaymentStatus';
                await match.ref.update({ [userPaymentStatusField]: 'pending' });

                res.status(200).send('Match found and payment link sent.');
            } catch (error) {
                console.error(`Failed to create or send Stripe payment link for match: ${error}`);
                res.status(500).send('Failed to create or send Stripe payment link for match.');
              }
            } else {
              // If there's no match, update the status to cancelled and send cancellation emails
              await match.ref.update({ status: 'cancelled' });
              const otherUserEmail = isUserA ? matchData.userBEmail : matchData.userAEmail;
              await sendCancellationEmail(email);
              console.log(`Cancellation email sent to ${email}`);
              await sendCancellationEmail(otherUserEmail);
              console.log(`Cancellation email sent to ${otherUserEmail}`);
              res.status(200).send('No match found. Match cancelled.');
            }
    }
});

// TODO: build out getMatchingDates
function getMatchingDates(userAvailabilityString: string, otherUserAvailabilityString: string) {
    const userAvailability = userAvailabilityString.split(', ').map(date => new Date(date));
    const otherUserAvailability = otherUserAvailabilityString.split(', ').map(date => new Date(date));
    return userAvailability.filter(date => otherUserAvailability.some(otherDate => otherDate.getTime() === date.getTime()));
}

// TODO: Create email utility function
async function sendCancellationEmail(email: string) {
    const message = {
        from_email: 'your-email@example.com',
        subject: 'Match Cancelled',
        text: 'Your match has been cancelled.',
        to: [
            {
                email: email,
                type: 'to',
            },
        ],
    };

    try {
        const response = await client.messages.send({ message });
        console.log(`Cancellation email sent to ${email}: ${response}`);
    } catch (error) {
        console.error(`Failed to send cancellation email to ${email}: ${error}`);
    }
}

// TODO: Build out createStripePaymentLink
async function createStripePaymentLink(matchRef: admin.firestore.DocumentReference<admin.firestore.DocumentData>, userField: string): Promise<string> {
    try {
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [{
          price: 'price_ID', // Replace 'price_ID' with your actual price ID
          quantity: 1,
        }],
        mode: 'payment',
        success_url: 'https://example.com/success',
        cancel_url: 'https://example.com/cancel',
      });

      // Update the Matches document with the session ID
      await matchRef.update({ [userField]: session.id });

      return session.url;
    } catch (error) {
      console.error(`Failed to create Stripe payment link: ${error}`);
      throw error; // Re-throw the error so it can be caught and handled by the calling function
    }
  }

  // TODO: Build out sendPaymentLinkEmail
  async function sendPaymentLinkEmail(email: string, paymentLink: string) {
    const message = {
      from_email: 'your-email@example.com',
      subject: 'Payment Link for Your Match',
      text: `Here is your payment link: ${paymentLink}`,
      to: [
        {
          email: email,
          type: 'to',
        },
      ],
    };
  
    try {
      const response = await client.messages.send({ message });
      console.log(`Payment link email sent to ${email}: ${response}`);
    } catch (error) {
      console.error(`Failed to send payment link email to ${email}: ${error}`);
      throw error; // Re-throw the error so it can be caught and handled by the calling function
    }
  }