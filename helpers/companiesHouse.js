const axios = require('axios');

const checkCompanyName = async (companyName) => {
  try {
    const apiKey = process.env.COMPANIES_HOUSE_API_KEY;
    const encodedApiKey = Buffer.from(`${apiKey}:`).toString('base64');
    
    const response = await axios.get(`https://api.company-information.service.gov.uk/search/companies?q=${companyName}`, {
      headers: {
        Authorization: `Basic ${encodedApiKey}`
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('Error checking company name:', error.response ? error.response.data : error.message);
    throw error;
  }
};

module.exports = { checkCompanyName };
