const express = require('express');
const router = express.Router();

// Client dashboard
router.get('/', (req, res) => {
  res.render('client_dashboard', { user: req.user });
});

// Other client-related routes can be added here

module.exports = router;
