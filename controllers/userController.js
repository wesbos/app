const mongoose = require('mongoose');
const User = mongoose.model('User');

require('../services/passport');
const passport = require('passport');
const promisify = require('es6-promisify');

exports.logout = (req, res) => {
  req.logout();
  req.flash('success', 'You are now logged out!');
  res.redirect('/');
};

exports.loginForm = (req, res) => {
  res.render('login', { title: 'Login' });
};

exports.validateRegister = (req, res, next) => {
  // First we need to check that our data is good!
  req.sanitizeBody('name').trim();
  req.checkBody('name', 'You must supply a name').notEmpty();

  req.checkBody('email', 'That email isn\'t valid').isEmail();
  req.sanitizeBody('email').normalizeEmail({ remove_dots: false, remove_extension: false, gmail_remove_subaddress: false });

  req.checkBody('password', 'Password cannot be blank').notEmpty();
  req.checkBody('password-confirm', 'Confirmed Password cannot be blank').notEmpty();
  req.checkBody('password-confirm', 'Oops - your Passwords do not match').equals(req.body.password);

  const errors = req.validationErrors();
  if (errors) {
    req.flash('error', errors.map(err => err.msg));
    res.render('register', { title: 'Register', body: req.body, flashes: req.flash() });
    return;
  }

  // otherwise we good - move onto the next function
  next();
};

exports.register = async (req, res, next) => {
  const user = new User({ email : req.body.email, name: req.body.name });
  const register = promisify(User.register, User);
  const account = await register(user, req.body.password);
  next();  // pass to authController.login()
};

exports.account = (req, res) => {
  res.render('account', { user: req.user });
};

exports.updateAccount = async (req, res) => {

  const updates = {
    name: req.body.name,
    email: req.body.email
  };
  const user = await User.findOneAndUpdate(
    { _id: req.user._id },
    { $set: updates },
    // new variable returns the updated document, not the old one!
    // run validators will ensure you aren't updating to bad data
    // context is required from mongoose
    { new: true, runValidators: true, context: 'query' }
  ); // maybe needs .exec() ?

  console.log('Updated User!');
  console.log(user);

  req.flash('success', `Successfully updated ${user.name}`);

  // re-log them in so you can serialize the user
  await req.login(user);
  res.redirect('/account');

};
