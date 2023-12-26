import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import axios from 'axios';

// TODO: Set up a Firebase Cloud Function that runs on a schedule every week
// TODO: Build out tests
export const createWeeklySurvey = functions.https.onRequest(async (req, res) => {
    try {
        const typeformApiKey = functions.config().typeform.key;
        var surveyRef: any;

        // Retrieve the theme ID
        const themeResponse = await axios.get('https://api.typeform.com/themes', {
            headers: { Authorization: `Bearer ${typeformApiKey}` },
            params: { page_size: 200 }
        });

        const themes = themeResponse.data.items;
        const theme = themes.find((theme: { name: string; }) => theme.name === 'Availability Survey');
        console.log('Theme:', theme);
        if (!theme) {
            throw new Error('Theme not found');
        }


        // Define the structure of the new survey
        const survey = {
            title: `Availability Survey (${getDate()})`,
            hidden: ['email'], // This will add a hidden email field
            theme: {
                href: `https://api.typeform.com/themes/${theme.id}`
            },
            fields: [
                {
                    title: 'Which days are you available next week?',
                    type: 'multiple_choice',
                    ref: 'availability_next_week',
                    properties: {
                        description: 'Please select all that apply.',
                        randomize: false,
                        allow_multiple_selection: true,
                        allow_other_choice: false,
                        vertical_alignment: true,
            choices: getChoicesForNextWeek().concat([{ label: 'None of these dates' }])
                    }
                },
                {
                    title: 'Which days are you available the week after next?',
                    type: 'multiple_choice',
                    ref: 'availability_week_after_next',
                    properties: {
                        description: 'Please select all that apply.',
                        randomize: false,
                        allow_multiple_selection: true,
                        allow_other_choice: false,
                        vertical_alignment: true,
                        choices: getChoicesForWeekAfterNext().concat([{ label: 'None of these dates' }])
                    }
                },
            ],
            "thankyou_screens": [
                {
                    "title": "Thank you for completing your availability survey.",
                    "ref": "thank_you",
                    "properties": {
                        "show_button": false,
                        "share_icons": false
                    }
                }
            ]
        };

        // Use the Typeform Create API to create the new survey
        const createResponse = await axios.post('https://api.typeform.com/forms', survey, {
            headers: { Authorization: `Bearer ${typeformApiKey}` }
        });
        
        surveyRef = createResponse;

        // console.log('Form updated successfully');
        let surveyUrl = surveyRef.data._links.display;

        // Append "#email=" to the survey URL
        surveyUrl += "#email=";

        // Initialize Firestore
        const db = admin.firestore();

        try {
            // Save the survey URL in Firestore with a createdAt field
            await db.collection('Surveys').add({
                url: surveyUrl,
                createdAt: admin.firestore.FieldValue.serverTimestamp()
            });
            console.log('Survey URL stored successfully:', surveyUrl);
        } catch (error) {
            console.error('Error storing survey URL:', error);
        }

        res.status(200).send('Survey created successfully');
    } catch (error:any) {
        console.error('Error creating survey:', error.message);
        if (error.response) {
            console.error('Response data:', error.response.data);
        }
        res.status(500).send('Error creating survey');
    }
});

function getDate() {
    const today = new Date();
    return today.toLocaleDateString('en-GB', { day: 'numeric', month: 'numeric' });
}

function getChoicesForNextWeek() {
    const choices = [];
    const today = new Date();
    const oneDay = 24 * 60 * 60 * 1000; // milliseconds in a day

    for (let i = 4; i < 11; i++) {
        const nextDay = new Date(today.getTime() + oneDay * i);
        const dayOfWeek = nextDay.toLocaleString('default', { weekday: 'long' });
        const date = nextDay.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit' });
        choices.push({ label: `${dayOfWeek} ${date}` });
    }

    return choices;
}

function getChoicesForWeekAfterNext() {
    const choices = [];
    const today = new Date();
    const oneDay = 24 * 60 * 60 * 1000; // milliseconds in a day

    for (let i = 11; i < 18; i++) {
        const nextDay = new Date(today.getTime() + oneDay * i);
        const dayOfWeek = nextDay.toLocaleString('default', { weekday: 'long' });
        const date = nextDay.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit' });
        choices.push({ label: `${dayOfWeek} ${date}` });
    }

    return choices;
}
