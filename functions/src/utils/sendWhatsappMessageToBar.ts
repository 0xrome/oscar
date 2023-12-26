import axios from 'axios';

export async function sendWhatsappMessageToBar(matchDate: Date) {
  const message = {
    phone: 'bar-phone-number', // Replace with the bar's phone number
    body: `A table for two has been booked for ${matchDate.toISOString()}.`,
  };

  try {
    const response = await axios.post('https://api.whatsapp.com/send', message);
    console.log(`WhatsApp message sent to bar: ${response}`);
  } catch (error) {
    console.error(`Failed to send WhatsApp message to bar: ${error}`);
    throw error; // Re-throw the error so it can be caught and handled by the calling function
  }
}