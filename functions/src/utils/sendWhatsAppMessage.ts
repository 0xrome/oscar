import axios from "axios";

const sendWhatsAppMessage = async (userPhone: string, templateName: string) => {
    console.log(`Sending ${templateName} WhatsApp message to ${userPhone}`);

    const requestBody = {
        messaging_product: "whatsapp",
        to: userPhone,
        type: "template",
        template: {
            name: templateName,
            language: {
                code: 'en_US'  //TODO: Switch to en_UK if there's a problem
            }
        }
    };

    try {
        const response = await axios.post('https://graph.facebook.com/v17.0/186794244523147/messages', requestBody, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer EAANJVZBZCZAlKIBO5qmHC1fgbVqIxKYM5ZAwh7pXEh6ZCWnNWT0S6ldWx7nVeIS8QaYtkYEEhqxDZAJFQgK7g3v1D2zP726KlLpkEDQliZAXNEX8oHSx7OA5vlLXl0lVbBcvZAEY3epW5hEEcuHbjZCneR6s0pre7XWwupEbnr8ZAb2JqtTbB6nXZAmtFPbjAHJy0lDLS1po8gjiTHdGce2iagmin3pNnAZD'
            }
        });

        console.log(`Message sent to ${userPhone}: ${response.data}`);
    } catch (error) {
        console.error(`Failed to send message to ${userPhone}: ${error}`);
    }
}

export default sendWhatsAppMessage;