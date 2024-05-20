const express = require('express');
const router = express.Router();

// Client Dashboard
router.get('/', (req, res) => {
  if (!req.user) {
    return res.redirect('/users/login');
  }
  res.render('client_dashboard', { user: req.user });
});

module.exports = router;
