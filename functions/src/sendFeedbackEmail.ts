import * as functions from 'firebase-functions';
import axios from 'axios';
import db from './utils/db';

export const sendFeedbackEmail = functions.pubsub.schedule('every 1 hours').onRun(async (context) => {
  const currentTime = new Date();
  const twentyFourHoursAgo = new Date(currentTime.getTime() - 24 * 60 * 60 * 1000);

  const matchesSnapshot = await db.collection('Matches')
    .where('date', '>=', twentyFourHoursAgo)
    .where('date', '<', currentTime)
    .where('feedbackEmailSent', '==', false)
    .get();

  matchesSnapshot.forEach(async (doc) => {
    const match = doc.data();

    const surveyLink = "https://your_mailchimp_survey_link"; // TODO: Replace with actual Mailchimp survey link

    // TODO: Replace with actual Mailchimp API key + template name
    await axios.post('https://api.mailchimp.com/3.0/transactional/send', {
      template_name: "your_template_name",
      message: {
        to: [{ email: match.userAEmail }, { email: match.userBEmail }],
        from_email: "your_email@example.com",
        subject: "Feedback for your recent date",
        merge_vars: [
          {
            rcpt: match.userAEmail,
            vars: [
              { name: "USER_NAME", content: match.userAName },
              { name: "SURVEY_LINK", content: surveyLink },
            ],
          },
          {
            rcpt: match.userBEmail,
            vars: [
              { name: "USER_NAME", content: match.userBName },
              { name: "SURVEY_LINK", content: surveyLink },
            ],
          },
        ],
      },
    });

    await db.collection('Matches').doc(doc.id).update({ feedbackEmailSent: true });
  });
});