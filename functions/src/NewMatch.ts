import * as functions from 'firebase-functions';
import mailchimpClient from '../../utils/mailchimpSetup';
import db from './utils/db';

// New Match document structure
// {
//     createdAt: Timestamp,
//     userAName: String,
//     userABio: String,
//     userAEmail: String,
//     userAPhone: String,
//     userASurveyCompleted: Boolean,
//     availabilitySurveyuserA: String,
//     userBName: String,
//     userBBio: String,
//     userBEmail: String,
//     userBPhone: String,
//     userBSurveyCompleted: Boolean,
//     availabilitySurveyuserB: String,
//     availabilitySurvey: String,
//     availabilityReminderSent: Boolean
// }

// TODO: Build out tests
export const newMatch = functions.firestore.document('Matches/{matchId}').onCreate(async (snapshot, context) => {
    const newMatch = snapshot.data();
    const { userAName, userABio, userAEmail, userBName, userBBio, userBEmail } = newMatch;
    console.log('New match found:', newMatch);

    const { availabilitySurveyUserA, availabilitySurveyUserB } = await getAndStoreSurveyURLs(userAEmail, userBEmail, snapshot);
    await Promise.all([
        sendMessage(userAEmail, userAName, userBName, userBBio, availabilitySurveyUserA),
        sendMessage(userBEmail, userBName, userAName, userABio, availabilitySurveyUserB)
    ]);
});

async function getAndStoreSurveyURLs(userAEmail: string, userBEmail: string, snapshot: any) {

    // Retrieve the survey URL from Firestore
    const surveyQuery = await db.collection('Surveys')
                            .orderBy('createdAt', 'desc')
                            .limit(1)
                            .get();
    const surveyDoc = surveyQuery.docs[0];
    const availabilitySurvey = surveyDoc.data().url;
    console.log('Availability survey URL:', availabilitySurvey);

    // Append the email address to the survey URL
    const availabilitySurveyUserA = availabilitySurvey + userAEmail;
    const availabilitySurveyUserB = availabilitySurvey + userBEmail;
    console.log('Availability survey URL for User A:', availabilitySurveyUserA);
    console.log('Availability survey URL for User B:', availabilitySurveyUserB);

    // Add the survey links to the match data
    await snapshot.ref.update({ availabilitySurveyUserA, availabilitySurveyUserB, availabilitySurvey });

    return { availabilitySurveyUserA, availabilitySurveyUserB };
}

async function sendMessage(userEmail: string, userName: string, otherUserName: string, otherUserBio: string, availabilitySurvey: string) {
    const message = {
        template_name: 'match-found',
        template_content: [], 
        message: {
            subject: 'New Match Found!',
            from_email: 'hi@matchedbyoscar.com',
            to: [{ email: userEmail, name: userName, type: 'to' }],
            global_merge_vars: [
                { name: 'userName', content: userName },
                { name: 'otherUserName', content: otherUserName },
                { name: 'otherUserBio', content: otherUserBio },
                { name: 'availabilitySurvey', content: availabilitySurvey }
            ]
        }
    };

    return mailchimpClient.messages.sendTemplate(message)
        .then(() => console.log(`Email sent to ${userName} successfully.`))
        .catch((err: any) => console.error(`Failed to send email to ${userName}:`, err));
}