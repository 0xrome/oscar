export const sendDateReminder = async () => {
    const now = admin.firestore.Timestamp.now();
    const twentyFourHoursFromNow = moment(now.toDate()).add(24, 'hours').toDate();
    const twentyThreeHoursFromNow = moment(now.toDate()).add(23, 'hours').toDate();
  
    const matchesQuery = await db.collection('Matches')
      .where('date', '>', twentyThreeHoursFromNow)
      .where('date', '<=', twentyFourHoursFromNow)
      .where('reminderSent', '==', false)
      .where('dateStatus', '==', 'confirmed')
      .get();
  
    matchesQuery.docs.forEach(async (doc) => {
      const match = doc.data();
      await sendWhatsappMessage(match.userAPhone, `Reminder: You have a date scheduled at ${match.location} on ${match.date.toDate()}.`);
      await sendWhatsappMessage(match.userBPhone, `Reminder: You have a date scheduled at ${match.location} on ${match.date.toDate()}.`);
      await doc.ref.update({ reminderSent: true });
    });
  }
  
  // Define other reminder functions here
  
  const sendWhatsappMessage = async (phoneNumber: string, message: string) => {
    const requestBody = {
      phone: phoneNumber,
      body: message,
    };
    await axios.post('https://api.whatsapp.com/send', requestBody);
  };