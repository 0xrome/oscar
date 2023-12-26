export const sendFeedbackFormReminder = async () => {
    const now = admin.firestore.Timestamp.now();
    const twentyFourHoursAgo = moment(now.toDate()).subtract(24, 'hours').toDate();
  
    // TODO: Update this to actually be relevant for our codebase
    const formQuery = await db.collection('Forms')
      .where('formSentAt', '>', twentyFourHoursAgo)
      .where('formCompleted', '==', false)
      .get();
  
    formQuery.docs.forEach(async (doc) => {
      const form = doc.data();
      const { phoneNumber } = form;
  
      // Send a reminder if the form is still not completed after 24 hours
      await sendWhatsappMessage(phoneNumber, 'This is your reminder to complete the form.');
    });
  }
  
  const sendWhatsappMessage = async (phoneNumber: string, message: string) => {
    const requestBody = {
      phone: phoneNumber,
      body: message,
    };
    await axios.post('https://api.whatsapp.com/send', requestBody);
  };