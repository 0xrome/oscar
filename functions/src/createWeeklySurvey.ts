import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import axios from 'axios';
import db from './utils/db';

// TODO: Swap to pubsub schedule once ready to deploy
// Runs every monday at 00:00 UTC
// export const createWeeklySurvey = functions.pubsub.schedule('0 0 * * 1').timeZone('UTC').onRun(async (req, res) => {

export const getTypeformConfig = () => {
    const typeformConfig = functions.config().typeform;
    if (!typeformConfig || !typeformConfig.key) {
        throw new Error('Missing Typeform API key in function configuration.');
    }
    return typeformConfig.key;
}

export const getTheme = async (typeformApiKey: string) => {
    const response = await axios.get('https://api.typeform.com/themes', {
        headers: { Authorization: `Bearer ${typeformApiKey}` },
        params: { page_size: 200 }
    });
    const themes = response.data.items;
    const theme = themes.find((theme: { name: string; }) => theme.name === 'Availability Survey');
    if (!theme) {
        throw new Error('Theme not found');
    }
    return theme;
}

export const createSurvey = async (typeformApiKey: string, survey: any) => {
    try {
        const response = await axios.post('https://api.typeform.com/forms', survey, {
            headers: { Authorization: `Bearer ${typeformApiKey}` }
        });
        return response.data;
    } catch (error: any) {
        if (error.response && error.response.status === 429) {
            console.error('Hit Typeform API rate limit');
            // Handle rate limit error, e.g. by retrying after a delay, or returning an error response
        } else {
            // Handle other errors
            throw error;
        }
    }
}

export const createSurveyLogic = async (typeformApiKey: string) => {
    try {
        console.log('Starting createSurveyLogic');
        const theme = await getTheme(typeformApiKey);

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
                    choices: getChoicesForWeek(4, 11)
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
                    choices: getChoicesForWeek(11, 18).concat([{ label: 'None of these dates' }])
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

    const surveyRef = await createSurvey(typeformApiKey, survey);
    let surveyUrl = surveyRef._links.display;
    surveyUrl += "#email=";

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
        console.log('Finished createSurveyLogic');
        return surveyUrl;
    } catch (error) {
        console.error('Error in createSurveyLogic:', error);
        throw error;
    }
}

export const createWeeklySurvey = functions.https.onRequest(async (req: any, res: any) => {
    try {
        console.log('About to get Typeform API key');
        const typeformApiKey = getTypeformConfig();
        console.log('Got Typeform API key:', typeformApiKey);
        console.log('About to call createSurveyLogic');
        const result = await createSurveyLogic(typeformApiKey);
        console.log('Called createSurveyLogic, got result:', result);
        if (result) {
            console.log('Result is truthy, about to send success response');
            res.status(200).send('Survey created successfully');
        } else {
            console.log('Result is not truthy, about to send error response');
            res.status(500).send('Error creating survey');
        }
    } catch (error:any) {
        console.error('Caught error:', error.message);
        if (error.response) {
            console.error('Response data:', error.response.data);
        }
        console.log('About to send error response due to caught error');
        res.status(500).send('Error creating survey');
    }
});

function getDate() {
    const today = new Date();
    return today.toLocaleDateString('en-GB', { day: 'numeric', month: 'numeric' });
}

function getChoicesForWeek(startDay: number, endDay: number) {
    const choices = [];
    const today = new Date();
    const oneDay = 24 * 60 * 60 * 1000; // milliseconds in a day

    for (let i = startDay; i < endDay; i++) {
        const nextDay = new Date(today.getTime() + oneDay * i);
        const dayOfWeek = nextDay.toLocaleString('default', { weekday: 'long' });
        const date = nextDay.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit' });
        choices.push({ label: `${dayOfWeek} ${date}` });
    }

    return choices;
}
