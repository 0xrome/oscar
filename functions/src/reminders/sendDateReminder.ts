import db from "../utils/db";

export const sendDateReminder = async () => {
    const now = admin.firestore.Timestamp.now();
    const twentyFourHoursFromNow = moment(now.toDate()).add(24, 'hours').toDate();
    const twentyThreeHoursFromNow = moment(now.toDate()).add(23, 'hours').toDate();
  
    // TODO: Update how many hours until date
    // TODO: Make sure reminderSent, dateStatus, userAPhone and userBPhone are indexed in the Matches collection
    const matchesQuery = await db.collection('Matches')
      .where('date', '>', twentyThreeHoursFromNow)
      .where('date', '<=', twentyFourHoursFromNow)
      .where('reminderSent', '==', false)
      .where('dateStatus', '==', 'confirmed')
      .get();

      if (matchesQuery.empty) {
        console.log('No matches found that need reminders sent.');
        return;
      }
  
    matchesQuery.docs.forEach(async (doc: { data: () => any; ref: { update: (arg0: { reminderSent: boolean; }) => any; }; }) => {
      const match = doc.data();
      await sendWhatsappMessage(match.userAPhone, `Reminder: You have a date scheduled at ${match.location} on ${match.date.toDate()}.`);
      await sendWhatsappMessage(match.userBPhone, `Reminder: You have a date scheduled at ${match.location} on ${match.date.toDate()}.`);
      await doc.ref.update({ reminderSent: true });
    });
  }
  
  // TODO: Update to use WA utiltiy function if possible
  const sendWhatsappMessage = async (phoneNumber: string, message: string) => {
    const requestBody = {
      phone: phoneNumber,
      body: message,
    };
    await axios.post('https://api.whatsapp.com/send', requestBody);
  };