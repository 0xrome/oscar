import * as functions from 'firebase-functions';
import mailchimpClient from '../../utils/mailchimpSetup';

export const newMatch = functions.firestore.document('Matches/{matchId}').onCreate((snapshot, context) => {
    const newMatch = snapshot.data();
    const { userAName, userABio, userAEmail, userBName, userBBio, userBEmail } = newMatch;
    console.log('New match found:', newMatch);
3
    const messageToUserA = {
        template_name: 'test-user-a',
        template_content: [
            { name: 'userAName', content: userAName },
            { name: 'userBName', content: userBName },
            { name: 'userBBio', content: userBBio }
        ],
        message: {
            subject: 'New Match Found!',
            from_email: 'hi@matchedbyoscar.com',
            to: [{ email: userAEmail, name: userAName, type: 'to' }],
        }
    };

    const messageToUserB = {
        template_name: 'test-user-b',
        template_content: [ 
            { name: 'userBName', content: userBName },
            { name: 'userAName', content: userAName },
            { name: 'userABio', content: userABio }
        ],
        message: {
            subject: 'New Match Found!',
            from_email: 'hi@matchedbyoscar.com',
            to: [{ email: userBEmail, name: userBName, type: 'to' }],
        }
    };

    return Promise.all([
        mailchimpClient.messages.sendTemplate(messageToUserA)
            .then(() => console.log('Email sent to User A successfully.'))
            .catch((err: any) => console.error('Failed to send email to User A:', err)),
    
        mailchimpClient.messages.sendTemplate(messageToUserB)
            .then(() => console.log('Email sent to User B successfully.'))
            .catch((err: any) => console.error('Failed to send email to User B:', err))
    ]);
});