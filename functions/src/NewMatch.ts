import * as admin from 'firebase-admin';
import mailchimpClient from '../../utils/mailchimpSetup';

const db = admin.firestore();

db.collection('Matches').onSnapshot((snapshot: admin.firestore.QuerySnapshot) => {
    snapshot.docChanges().forEach((change: admin.firestore.DocumentChange) => {
        if (change.type === 'added') {
            const newMatch = change.doc.data();
            const { userAName, userABio, userAEmail, userBName, userBBio, userBEmail } = newMatch;

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

            mailchimpClient.messages.sendTemplate(messageToUserA)
                .then(() => console.log('Email sent to User A successfully.'))
                .catch((err: any) => console.error('Failed to send email to User A:', err));

            mailchimpClient.messages.sendTemplate(messageToUserB)
                .then(() => console.log('Email sent to User B successfully.'))
                .catch((err: any) => console.error('Failed to send email to User B:', err));
        }
    });
});