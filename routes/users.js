const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');
const User = require('../models/User');

// Login Page
router.get('/login', (req, res) => res.render('login'));

// Register Page
router.get('/register', (req, res) => {
  const plan = req.query.plan || 'basic';
  res.render('register', { plan });
});

// Register Handle
router.post('/register', async (req, res) => {
  const { plan, owners, activities, email, password, password2 } = req.body;
  let errors = [];

  if (!email || !password || !password2 || !owners || !activities) {
    errors.push({ msg: 'Please fill in all fields' });
  }

  if (password !== password2) {
    errors.push({ msg: 'Passwords do not match' });
  }

  if (password.length < 6) {
    errors.push({ msg: 'Password should be at least 6 characters' });
  }

  if (errors.length > 0) {
    return res.render('register', {
      errors,
      plan,
      owners,
      activities,
      email,
      password,
      password2
    });
  } else {
    try {
      const user = await User.findOne({ email });
      if (user) {
        errors.push({ msg: 'Email is already registered' });
        return res.render('register', {
          errors,
          plan,
          owners,
          activities,
          email,
          password,
          password2
        });
      } else {
        const newUser = new User({
          email,
          password,
          plan,
          owners,
          activities: activities.split(',').map(activity => activity.trim())
        });

        const salt = await bcrypt.genSalt(10);
        newUser.password = await bcrypt.hash(password, salt);

        await newUser.save();
        req.flash('success_msg', 'You are now registered and can log in');
        res.redirect('/users/login');
      }
    } catch (err) {
      console.error(err);
      res.render('register', {
        errors: [{ msg: 'An error occurred. Please try again.' }],
        plan,
        owners,
        activities,
        email,
        password,
        password2
      });
    }
  }
});

// Login Handle
router.post('/login', (req, res, next) => {
  passport.authenticate('local', {
    successRedirect: '/client',
    failureRedirect: '/users/login',
    failureFlash: true
  })(req, res, next);
});

// Logout Handle
router.get('/logout', (req, res) => {
  req.logout();
  req.flash('success_msg', 'You are logged out');
  res.redirect('/users/login');
});

// Forgot Password Page
router.get('/forgot-password', (req, res) => res.render('forgot_password'));

// Forgot Password Handle
router.post('/forgot-password', (req, res) => {
  const { email } = req.body;
  let errors = [];

  if (!email) {
    errors.push({ msg: 'Please enter your email' });
  }

  if (errors.length > 0) {
    res.render('forgot_password', { errors });
  } else {
    // Generate token
    crypto.randomBytes(20, (err, buf) => {
      if (err) throw err;
      const token = buf.toString('hex');

      // Find user
      User.findOne({ email: email }).then(user => {
        if (!user) {
          errors.push({ msg: 'No account with that email address exists' });
          return res.render('forgot_password', { errors });
        }

        // Set token and expiry
        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

        user.save().then(() => {
          // Send email
          const smtpTransport = nodemailer.createTransport({
            service: 'Gmail',
            auth: {
              user: 'your-email@gmail.com',
              pass: 'your-email-password'
            }
          });

          const mailOptions = {
            to: user.email,
            from: 'passwordreset@demo.com',
            subject: 'Password Reset',
            text: `You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n
                   Please click on the following link, or paste this into your browser to complete the process:\n\n
                   http://${req.headers.host}/users/reset-password/${token}\n\n
                   If you did not request this, please ignore this email and your password will remain unchanged.\n`
          };

          smtpTransport.sendMail(mailOptions, (err) => {
            req.flash('success_msg', 'An email has been sent to ' + user.email + ' with further instructions.');
            res.redirect('/users/forgot-password');
          });
        });
      });
    });
  }
});

// Reset Password Page
router.get('/reset-password/:token', (req, res) => {
  User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, (err, user) => {
    if (!user) {
      req.flash('error_msg', 'Password reset token is invalid or has expired.');
      return res.redirect('/users/forgot-password');
    }
    res.render('reset_password', { token: req.params.token });
  });
});

// Reset Password Handle
router.post('/reset-password/:token', (req, res) => {
  const { password, password2 } = req.body;
  let errors = [];

  if (!password || !password2) {
    errors.push({ msg: 'Please fill in all fields' });
  }

  if (password !== password2) {
    errors.push({ msg: 'Passwords do not match' });
  }

  if (password.length < 6) {
    errors.push({ msg: 'Password should be at least 6 characters' });
  }

  if (errors.length > 0) {
    res.render('reset_password', {
      errors,
      token: req.params.token
    });
  } else {
    User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, (err, user) => {
      if (!user) {
        req.flash('error_msg', 'Password reset token is invalid or has expired.');
        return res.redirect('/users/forgot-password');
      }

      // Set new password
      bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(password, salt, (err, hash) => {
          if (err) throw err;
          user.password = hash;
          user.resetPasswordToken = undefined;
          user.resetPasswordExpires = undefined;

          user.save().then(() => {
            req.flash('success_msg', 'Your password has been updated.');
            res.redirect('/users/login');
          }).catch(err => console.log(err));
        });
      });
    });
  }
});

module.exports = router;
