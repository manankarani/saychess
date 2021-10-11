const express = require('express');
const router = express.Router();
const { ensureAuthenticated, forwardAuthenticated } = require('../config/auth');

// Welcome Page
router.get('/', forwardAuthenticated, (req, res) => res.send("welcome"));

// Dashboard
//ADD ENSURE AUTHENTICATION LATER
router.get('/dashboard', (req, res) =>
  res.render('dash.ejs', {
    user: req.user
  })
);

module.exports = router;