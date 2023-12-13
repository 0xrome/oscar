import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import axios from 'axios';

export const createWeeklySurvey = functions.https.onRequest(async (req, res) => {
    try {
        const typeformApiKey = functions.config().typeform.key;
        var surveyRef: any;
        var formId: any;

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
                {
                    title: 'Thank you for your response!',
                    type: 'statement',
                    ref: 'thank_you'
                }
            ],
        };

        // Use the Typeform Create API to create the new survey
        const createResponse = await axios.post('https://api.typeform.com/forms', survey, {
            headers: { Authorization: `Bearer ${typeformApiKey}` }
        });
        formId = createResponse.data.id;
        surveyRef = createResponse;

        // Retrieve the form definition
        const formResponse = await axios.get(`https://api.typeform.com/forms/${formId}`, {
            headers: { 'Authorization': `Bearer ${typeformApiKey}` }
        });
        const form = formResponse.data;
        const field = form.fields.find((field: { ref: string; }) => field.ref === 'availability_next_week');
        const refId = field.properties.choices[field.properties.choices.length - 1].ref;

        // Add the logic condition
        form.logic = [
            {
                type: 'field',
                ref: 'availability_next_week',
                actions: [
                    {
                        action: 'jump',
                        details: {
                            to: {
                                type: 'field',
                                value: 'thank_you'
                            }
                        },
                        condition: {
                            op: 'is_not',
                            vars: [
                                { type: 'field', value: 'availability_next_week' },
                                { type: 'choice', value: refId }
                            ]
                        }
                    }
                ]
            },
        ]

        // Update the form
        await axios.put(`https://api.typeform.com/forms/${formId}`, form, {
            headers: { 'Authorization': `Bearer ${typeformApiKey}` }
        });

        console.log('Form updated successfully');
        const surveyUrl = surveyRef.data._links.display;

        // Initialize Firestore
        const db = admin.firestore();

        // Save the survey URL in Firestore
        await db.collection('Surveys').doc('current').set({ url: surveyUrl });

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
    return today.toLocaleDateString('default', { month: 'numeric', day: 'numeric' });
}

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
