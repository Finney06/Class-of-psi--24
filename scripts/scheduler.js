import { schedule } from 'node-cron';
import { sendBirthdayMessages } from './bot.js';

// Schedule the function to run daily at midnight
schedule('0 8 * * *', () => {
  sendBirthdayMessages();
  console.log('Scheduled task executed.');
});