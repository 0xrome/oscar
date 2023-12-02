import * as functions from 'firebase-functions';
import mailchimpClient from '../../utils/mailchimpSetup';

export const newMatch = functions.firestore.document('Matches/{matchId}').onCreate((snapshot, context) => {
    const newMatch = snapshot.data();
    const { userAName, userABio, userAEmail, userBName, userBBio, userBEmail } = newMatch;
    console.log('New match found:', newMatch);

    const messageToUserA = {
        template_name: 'match-found',
        template_content: [], 
        message: {
            subject: 'New Match Found!',
            from_email: 'hi@matchedbyoscar.com',
            to: [{ email: userAEmail, name: userAName, type: 'to' }],
            global_merge_vars: [
                { name: 'userAName', content: userAName },
                { name: 'userBName', content: userBName },
                { name: 'userBBio', content: userBBio }
            ]
        }
    };

    const messageToUserB = {
        template_name: 'match-found-user-b',
        template_content: [],
        message: {
            subject: 'New Match Found!',
            from_email: 'hi@matchedbyoscar.com',
            to: [{ email: userBEmail, name: userBName, type: 'to' }],
            global_merge_vars: [ 
                { name: 'userBName', content: userBName },
                { name: 'userAName', content: userAName },
                { name: 'userABio', content: userABio }
            ]
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