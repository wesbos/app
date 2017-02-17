const mongoose = require('mongoose');
const User = mongoose.model('User');

require('../services/passport');

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

exports.register = (req, res, next) => {
  const newUser = new User(req.body);
  newUser
    .save()
    .then((user) => {
      // 3. Success - now we do a few things
      // 3.2 log them in
      req.login(user, (err) => {
        if (err) throw Error(err);
        // 3.1 Tell them it worked!
        req.flash('success', 'Account Created! You are now signed in!');
        res.redirect('/');
      });
    })
    .catch((err) => {
      // loop over all possible validation errors and re-render the register page
      Object.keys(err.errors).forEach(key => {
        req.flash('error', err.errors[key].message);
      });
      res.render('register', { title: 'Register', flashes: req.flash(), body: req.body });
      // console.error(err);
    });
};

exports.account = (req, res) => {
  res.render('account', { user: req.user });
};

exports.updateAccount = (req, res) => {
  const updates = {
    name: req.body.name,
    email: req.body.email
  };

  User
    .findOneAndUpdate(
      { _id: req.user._id },
      { $set: updates },
      // new variable returns the updated document, not the old one!
      { new: true, runValidators: true }
    )
    .exec()
    .then(user => {
      req.flash('success', `Successfully updated ${user.name}`);
      // re -sign them in - forces a re-serialize
      req.login(user, () => {
        res.redirect('/account');
      });
    })
    .catch(err => {
      if (err.errors) {
        const errorKeys = Object.keys(err.errors);
        errorKeys.forEach(key => req.flash('error', err.errors[key].message));
        res.redirect('/account');
      }
      console.log(err);
    });
};
