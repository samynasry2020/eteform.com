const axios = require('axios');
require('dotenv').config();

const apiKey = process.env.COMPANIES_HOUSE_API_KEY;

async function checkCompanyName(companyName) {
  try {
    const encodedApiKey = Buffer.from(apiKey + ':').toString('base64');
    console.log('Encoded API Key:', encodedApiKey);

    const response = await axios.get(`https://api.company-information.service.gov.uk/search/companies?q=${companyName}`, {
      headers: {
        'Authorization': `Basic ${encodedApiKey}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('API response:', response.data);
  } catch (error) {
    console.error('Error checking company name:', error.response ? error.response.data : error.message);
    if (error.response) {
      console.log('Error status:', error.response.status);
      console.log('Error headers:', error.response.headers);
    }
  }
}

// Replace 'test-company' with the company name you want to check
checkCompanyName('test-company');
