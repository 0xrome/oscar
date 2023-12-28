import * as functions from 'firebase-functions';

import { sendAvailabilityReminder } from './reminders/sendAvailabilityReminder';
import { sendDateReminder } from './reminders/sendDateReminder';
import { sendPaymentReminder, cancelUnpaidDates } from './reminders/sendPaymentReminderOrCancel';
import { sendFeedbackFormReminder } from './reminders/sendFeedbackFormReminder';

export const sendReminder = functions.pubsub.schedule('every 1 hours').onRun(async (context) => {
  await sendAvailabilityReminder();
  await sendPaymentReminder();
  await cancelUnpaidDates();
  await sendDateReminder();
  await sendFeedbackFormReminder();
});