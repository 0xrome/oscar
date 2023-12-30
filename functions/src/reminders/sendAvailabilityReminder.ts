import * as admin from 'firebase-admin';
import moment from 'moment';

import db from '../utils/db';
import sendWhatsappMessage from '../utils/sendWhatsAppMessage';

// TODO: Build tests
export const sendAvailabilityReminder = async () => {
    // Get the current date and time
    const now = admin.firestore.Timestamp.now();

    // Calculate the date and time 24 hours ago
    const twentyFourHoursAgo = moment(now.toDate()).subtract(24, 'hours').toDate();

    // Calculate the date and time 26 hours ago
    const twentySixHoursAgo = moment(now.toDate()).subtract(26, 'hours').toDate();

    // Query for matches that were created between 24 and 26 hours ago and the reminder hasn't been sent
    const matchesQuery = await db.collection('Matches')
                            .where('createdAt', '>', twentySixHoursAgo)
                            .where('createdAt', '<=', twentyFourHoursAgo)
                            .where('reminderSent', '==', false)
                            .get();

    // For each match, send a reminder message to the users who haven't completed their surveys
    matchesQuery.docs.forEach(async (doc) => {
        const match = doc.data();
        const { userASurveyCompleted, userBSurveyCompleted, userAPhone, userBPhone } = match;

        let reminderSent = false;

        // If User A hasn't completed their survey, send a reminder message and set reminderSent to true
        if (!userASurveyCompleted) {
            await sendWhatsappMessage("hello_world", userAPhone); //TODO: Update template name to availabilty_reminder
            reminderSent = true;
        }
    
        // If User B hasn't completed their survey, send a reminder message and set reminderSent to true
        if (!userBSurveyCompleted) {
            await sendWhatsappMessage("hello_world", userBPhone); //TODO: Update template name to availabilty_reminder
            reminderSent = true;
        }
    
        // If a reminder message was sent to either user, update reminderSent to true
        if (reminderSent) {
            await doc.ref.update({ availabilityReminderSent: true });
        }
    });
};