// bot.js
import fetch from 'node-fetch';
import 'dotenv/config';

// Function to fetch user data from Airtable and send birthday messages
async function sendBirthdayMessages() {
  try {
    const airtableApiKey = process.env.AIRTABLE_API_KEY;
    const baseId = 'appufz5VPar7viZy0';
    const tableName = 'tblmXStbPbBj88Z5E';
    const apiUrl = `https://api.airtable.com/v0/${baseId}/${tableName}`;

    const response = await fetch(apiUrl, {
      headers: {
        'Authorization': `Bearer ${airtableApiKey}`,
      },
    });

    if (!response.ok) {
      throw new Error('Error fetching data from Airtable');
    }

    const data = await response.json();
    const userInput = data.records.map(record => {
      const fields = record.fields;
      return {
        name: fields.Name,
        whatsappNumber: fields['Whatsapp Number'],
        nickname: fields.Nickname,
        dateOfBirth: fields['Date of Birth'],
        picture: fields.Picture && fields.Picture[0] && fields.Picture[0].url, // Ensure Picture URL exists
      };
    });

    // Get today's date
    const today = new Date();
    const todayMonth = today.getMonth() + 1; // Month starts from 0, so add 1 to get the actual month
    const todayDay = today.getDate();

    // Iterate through users to find whose birthday it is today
    userInput.forEach(user => {
      const [year, month, day] = user.dateOfBirth.split('-');
      const dobMonth = parseInt(month);
      const dobDay = parseInt(day);

      if (dobMonth === todayMonth && dobDay === todayDay) {
        console.log(`Today is ${user.name}'s birthday!`);

        // Use Ultramsg API to send a WhatsApp message
        const ultramsgUrl = 'https://api.ultramsg.com/instance85495/messages/image';
        const ultramsgToken = process.env.ULTRAMSG_TOKEN;

        // Send message to individual user
        const sendMessage = async (to, caption) => {
          const body = new URLSearchParams();
          body.append('token', ultramsgToken);
          body.append('to', to);
          body.append('image', user.picture); // URL of the image
          body.append('caption', caption); // Add a caption to the image
          body.append('priority', '10');

          const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: body,
            redirect: 'follow',
          };

          try {
            const response = await fetch(ultramsgUrl, requestOptions);
            const result = await response.text();
            console.log(result);
          } catch (error) {
            console.log('Error sending message:', error);
          }
        };

        // Send message to the user
        sendMessage(user.whatsappNumber, `Happy Birthday, ${user.nickname}🎂🎉🎁!`);

        // Send message to the group
        sendMessage('2347039600321-1611155720@g.us', `Happy Birthday, @${user.whatsappNumber.replace('+', '')}!`);
      }
    });
  } catch (error) {
    console.error('Error:', error);
  }
}

// Run the function
sendBirthdayMessages();

export { sendBirthdayMessages };
