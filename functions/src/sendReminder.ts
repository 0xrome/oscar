import * as functions from 'firebase-functions';

import { sendAvailabilityReminder } from './sendAvailabilityReminder';
import { sendDateReminder } from './sendDateReminder';
import { sendPaymentReminderOrCancel } from './sendPaymentReminderOrCancel';
import { sendFeedbackFormReminder } from './sendFeedbackFormReminder';

export const sendReminder = functions.pubsub.schedule('every 1 hours').onRun(async (context) => {
  await sendAvailabilityReminder();
  await sendPaymentReminderOrCancel();
  await sendDateReminder();
  await sendFeedbackFormReminder();
});