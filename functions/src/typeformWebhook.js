const app = express();
// Initialize Firebase Admin SDK
if (!admin.apps.length) {
    admin.initializeApp();
}
// Use body-parser middleware to parse the incoming JSON
app.use(bodyParser.json());
app.post("/typeform-webhook", async (
// eslint-disable-next-line @typescript-eslint/no-explicit-any
req, res) => {
    const formResponse = req.body;
    // Ensure it's a valid Typeform payload
    if (formResponse && formResponse.form_response) {
        console.log(formResponse.form_response);
        const db = admin.firestore();
        const docRef = db.collection("typeformResponses").doc();
        try {
            await docRef.set(formResponse.form_response);
            console.log("Data successfully written to Firestore");
        }
        catch (error) {
            console.error("Error writing to Firestore:", error);
        }
    }
    // Send a response to acknowledge receipt of the data
    res.sendStatus(200);
});
export const typeformWebhook = functions.https.onRequest(app);
