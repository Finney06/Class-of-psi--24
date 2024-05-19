const express = require('express');
const bodyParser = require('body-parser');
const fetch = require('node-fetch');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());

// Endpoint to handle form submission
app.post('/submit-form', async (req, res) => {
  const { formData, file } = req.body;

  try {
    // Upload image to Cloudinary
    const cloudinaryUrl = 'https://api.cloudinary.com/v1_1/dhiegatc6/upload';
    const formDataCloudinary = new FormData();
    formDataCloudinary.append('file', file);
    formDataCloudinary.append('upload_preset', process.env.CLOUDINARY_UPLOAD_PRESET);

    const cloudinaryResponse = await fetch(cloudinaryUrl, {
      method: 'POST',
      body: formDataCloudinary,
    });

    if (!cloudinaryResponse.ok) {
      throw new Error('Error uploading image to Cloudinary.');
    }

    const cloudinaryData = await cloudinaryResponse.json();
    formData.Picture[0].url = cloudinaryData.secure_url;

    // Send form data to Airtable via API
    const airtableResponse = await fetch('https://api.airtable.com/v0/appufz5VPar7viZy0/tblmXStbPbBj88Z5E', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.AIRTABLE_API_KEY}`
      },
      body: JSON.stringify({
        records: [
          {
            fields: formData
          }
        ]
      })
    });

    if (!airtableResponse.ok) {
      throw new Error('Error submitting form to Airtable.');
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Error submitting form:', error);
    res.status(500).json({ error: error.message });
  }
});

// Endpoint to check if user data exists
app.get('/check-user-data-exists', async (req, res) => {
  const email = req.query.email;
  try {
    const response = await fetch(`https://api.airtable.com/v0/appufz5VPar7viZy0/tblmXStbPbBj88Z5E?filterByFormula=SEARCH('${email}', Email)`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${process.env.AIRTABLE_API_KEY}`
      }
    });

    const data = await response.json();
    res.json({ exists: data.records.length > 0 });
  } catch (error) {
    console.error('Error checking user data:', error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
