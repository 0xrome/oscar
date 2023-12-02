import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import axios from 'axios';

export const createWeeklySurvey = functions.https.onRequest(async (req, res) => {
    // Define the structure of the new survey
    const survey = {
        title: 'Availability Survey',
        hidden: ['email'], // This will add a hidden email field
        fields: [
            {
                title: 'Which days are you available next week?',
                type: 'multiple_choice',
                ref: 'availability_next_week',
                choices: getChoicesForNextWeek().concat({ label: 'None of these dates' })
            },
            {
                title: 'Which days are you available the week after next?',
                type: 'multiple_choice',
                ref: 'availability_week_after_next',
                choices: getChoicesForWeekAfterNext()
            },
            {
                title: 'Thank you for your response!',
                type: 'statement',
                ref: 'thank_you'
            }
        ],
        logic: [
            {
                type: 'field',
                ref: 'availability_next_week',
                actions: [
                    {
                        action: 'jump',
                        details: {
                            to: 'availability_week_after_next'
                        },
                        condition: {
                            op: 'is',
                            vars: [
                                { type: 'field', value: 'availability_next_week' },
                                { type: 'choice', value: 'None of these dates' }
                            ]
                        }
                    }
                ]
            },
            {
                type: 'field',
                ref: 'availability_week_after_next',
                actions: [
                    {
                        action: 'jump',
                        details: {
                            to: 'thank_you'
                        }
                    }
                ]
            }
        ]
    };

    // Use the Typeform Create API to create the new survey
    const response = await axios.post('https://api.typeform.com/forms', survey, {
        headers: { Authorization: `Bearer ${process.env.TYPEFORM_API_KEY}` }
    });

    // Get the URL of the created survey
    const surveyUrl = response.data._links.display;

    // Initialize Firestore
    const db = admin.firestore();

    // Save the survey URL in a document in your Firestore database
    await db.collection('Surveys').doc('current').set({ url: surveyUrl });

    // At the end of your function, send a response to indicate that the function has completed
    res.status(200).send('Survey created successfully');
});

function getChoicesForNextWeek() {
    const choices = [];
    const today = new Date();
    const oneDay = 24 * 60 * 60 * 1000; // milliseconds in a day

    for (let i = 0; i < 7; i++) {
        const nextDay = new Date(today.getTime() + oneDay * (i + 1));
        const dayOfWeek = nextDay.toLocaleString('default', { weekday: 'long' });
        const date = nextDay.toLocaleDateString('default', { month: 'numeric', day: 'numeric' });
        choices.push({ label: `${dayOfWeek} ${date}` });
    }

    return choices;
}

function getChoicesForWeekAfterNext() {
    const choices = [];
    const today = new Date();
    const oneDay = 24 * 60 * 60 * 1000; // milliseconds in a day

    for (let i = 7; i < 14; i++) {
        const nextDay = new Date(today.getTime() + oneDay * (i + 1));
        const dayOfWeek = nextDay.toLocaleString('default', { weekday: 'long' });
        const date = nextDay.toLocaleDateString('default', { month: 'numeric', day: 'numeric' });
        choices.push({ label: `${dayOfWeek} ${date}` });
    }

    return choices;
}