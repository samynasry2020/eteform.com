const express = require('express');
const router = express.Router();
const axios = require('axios');
require('dotenv').config();
const { checkCompanyName } = require('../helpers/companiesHouse');


// Home Page
router.get('/', (req, res) => res.render('home'));

// Services Page
router.get('/services', (req, res) => res.render('services'));

// Contact Page
router.get('/contact', (req, res) => res.render('contact'));

// Check Company Name Availability
router.post('/check-name', async (req, res) => {
  const { companyName } = req.body;
  const apiKey = process.env.COMPANIES_HOUSE_API_KEY;

  try {
    const encodedApiKey = Buffer.from(`${apiKey}:`).toString('base64');
    const response = await axios.get(`https://api.company-information.service.gov.uk/search/companies?q=${companyName}`, {
      headers: {
        'Authorization': `Basic ${encodedApiKey}`,
        'Content-Type': 'application/json'
      }
    });

    const companies = response.data.items;
    if (companies.length === 0) {
      res.json('Company name is available. Congratulations!');
    } else {
      res.json('Company name is not available. Please try another name.');
    }
  } catch (error) {
    console.error('Error checking company name:', error.response ? error.response.data : error.message);
    if (error.response) {
      res.status(error.response.status).json('Error checking company name');
    } else {
      res.status(500).json('Error checking company name. Please try again later.');
    }
  }
});

module.exports = router;
