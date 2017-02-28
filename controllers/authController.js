const mongoose = require('mongoose');
const User = mongoose.model('User');
const crypto = require('crypto');
const passport = require('passport');
const mail = require('../services/mail');
const promisify = require('es6-promisify');

exports.login = passport.authenticate('local', {
  failureRedirect: '/login',
  successRedirect: '/',
  failureFlash: 'Failed Login',
  successFlash: 'You are now logged in!',
});

/*
  1. Forgot My Password Flow
*/
exports.forgot = async (req, res, next) => {
  // 1. see if user exists
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    req.flash('error', 'No account with that email address exists.');
    return res.redirect('/login');
  }

  // 2. Set their reset tokens
  user.resetPasswordToken = crypto.randomBytes(20).toString('hex');
  user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
  await user.save();

  // 3. Send them their password Reset Email
  await mail.send({
    user,
    file: 'password-reset',
    resetURL: `http://${req.headers.host}/account/reset/${user.resetPasswordToken}`,
    subject: 'Password Reset'
  });

  req.flash('success', 'You have been emailed a password reset link.');
  res.redirect('/login');

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

exports.update = async (req, res, next) => {
  const user = await User.findOne({
    resetPasswordToken: req.params.token, // token exists
    resetPasswordExpires: { $gt: Date.now() } // it's not an expired token
  });

  if (!user) {
    req.flash('error', 'Invalid or Expired Token');
    return res.redirect('back');
  }

  await promisify(user.setPassword, user)(req.body.password);
  user.resetPasswordExpires = undefined;
  user.resetPasswordToken = undefined;
  const updatedUser = await user.save();
  await req.login(updatedUser);
  req.flash('success', '💃 Nice! Your password has been reset and you are now logged in');
  res.redirect('/');
};

exports.isLoggedIn = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next(); // carry on!
  }
  req.flash('error', 'Oops, you should be logged in to do that!');
  res.redirect('/login');
};
