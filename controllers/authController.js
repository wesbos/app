const mongoose = require('mongoose');
const User = mongoose.model('User');
const crypto = require('crypto'); // built in!
const mail = require('../services/mail');
/*
  1. Forgot My Password
*/
exports.forgot = (req, res, next) => {
  // First we find a user with that email
  const email = req.body.email.toLowerCase().trim();
  User
    // 1. Find them
    .findOne({ email })
    // 2. Make Set their reset tokens
    .then(user => {
      if (!user) {
        req.flash('error', 'No account with that email address exists.');
        return res.redirect('/login');
      }
      user.resetPasswordToken = crypto.randomBytes(20).toString('hex');
      user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
      return user.save();
    })
    // 3. Send them their password Reset Email
    .then(user => {
      const resetURL = `http://${req.headers.host}/account/reset/${user.resetPasswordToken}`;

      mail.send({
        user,
        file: 'password-reset',
        resetURL,
        subject: 'Password Reset'
      });
    })
    // Tell them it worked!
    .then(() => {
      req.flash('success', 'You have been emailed a password reset link.');
      res.redirect('/login');
    })
    .catch(err => {
      next(err); // let express handle the error
    });
};

/*
  2. Check if it's a legit password reset
*/
exports.reset = (req, res, next) => {
  console.log(req.params);
  User.findOne({ resetPasswordToken: req.params.token }, (err, user) => {
    console.log(user);
    if (!user) {
      req.flash('error', 'Password reset token is invalid or has expired.');
      return res.redirect('/login');
    }
    res.render('reset', {
      user: req.user,
      title: 'Password Reset'
    });
  });
};

/*
  3. Update their password
*/

exports.confirmedPassword = (req, res, next) => {
  if (req.body.password === req.body['password-confirm']) {
    next();
    return;
  }
  req.flash('error', 'Passwords do not match');
  res.redirect('back');
};

exports.update = (req, res, next) => {
  User
    .findOne({
      resetPasswordToken: req.params.token, // token exists
      resetPasswordExpires: { $gt: Date.now() } // it's not an expired token
    })
    .then(user => {
      // check if it exists
      if (!user) {
        req.flash('error', 'Invalid or Expired Token');
        return res.redirect('back');
      }
      return user;
    })
    .then(user => {
      user.password = req.body.password;
      // delete these fields
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      return user.save();
    })
    .then(user => {
      req.login(user, (err) => {
        if (err) throw Error('Error Logging in');
        req.flash('success', '💃 Nice! Your password has been reset and you are now logged in');
        res.redirect('/');
      });
    })
    .catch(err => next(err));
};

exports.isLoggedIn = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next(); // carry on!
  }
  req.flash('error', 'Oops, you should be logged in to do that!');
  res.redirect('/login');
};
