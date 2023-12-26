import * as admin from 'firebase-admin';
import * as moment from 'moment';
import axios from 'axios';

import db from './utils/db';


export const sendAvailabilityReminder = async () => {
    // Get the current date and time
    const now = admin.firestore.Timestamp.now();

    // Calculate the date and time 24 hours ago
    const twentyFourHoursAgo = moment(now.toDate()).subtract(24, 'hours').toDate();

    // Calculate the date and time 25 hours ago
    const twentyFiveHoursAgo = moment(now.toDate()).subtract(25, 'hours').toDate();

    // Query for matches that were created between 24 and 25 hours ago and the reminder hasn't been sent
    const matchesQuery = await db.collection('Matches')
                            .where('createdAt', '>', twentyFiveHoursAgo)
                            .where('createdAt', '<=', twentyFourHoursAgo)
                            .where('reminderSent', '==', false)
                            .get();

    // For each match, send a reminder message to the users who haven't completed their surveys
    matchesQuery.docs.forEach(async (doc) => {
        const match = doc.data();
        const { userAEmail, userBEmail, userASurveyCompleted, userBSurveyCompleted } = match;

        let reminderSent = false;

        // If User A hasn't completed their survey, send a reminder message and set reminderSent to true
        if (!userASurveyCompleted) {
            await sendReminderMessage(userAEmail);
            reminderSent = true;
        }
    
        // If User B hasn't completed their survey, send a reminder message and set reminderSent to true
        if (!userBSurveyCompleted) {
            await sendReminderMessage(userBEmail);
            reminderSent = true;
        }
    
        // If a reminder message was sent to either user, update reminderSent to true
        if (reminderSent) {
            await doc.ref.update({ reminderSent: true });
        }
    });
};

async function sendReminderMessage(userEmail: string) {
    // Use the WhatsApp API to send a message
    // See https://developers.facebook.com/docs/whatsapp/api/messages for more information

    console.log(`Sending reminder message to ${userEmail}`);

    const message = 'This is your reminder to fill out the survey.';

    const requestBody = {
        phone: userEmail, // Replace with the user's phone number
        body: message,
    };

    try {
        const response = await axios.post('https://your-whatsapp-api-url', requestBody, {
            headers: {
                'Content-Type': 'application/json',
            },
            auth: {
                username: 'your-username',
                password: 'your-password',
            },
        });

        console.log(`Message sent to ${userEmail}: ${response.data}`);
    } catch (error) {
        console.error(`Failed to send message to ${userEmail}: ${error}`);
    }
}