// pull in passport libs
const passport = require('passport');
const LocalStrategy = require('passport-local');
// user model
const mongoose = require('mongoose');
const User = mongoose.model('User');

/*
  Local Login
*/
const localLogin = new LocalStrategy({ usernameField: 'email' }, (email, password, done) => {
  User
    .findOne({ email }, { name: 1, email: 1, password: 1 })
    .then(user => {
      // 2. Check if there is no user at all
      if (!user) {
        done('There is no user with this email', false);
        return;
      }

      // 3. If there is a user, check if their password matches
      user.comparePassword(password, (err, isMatch) => {
        if (err) {
          done(err);
          return;
        }
        console.log('is match?', isMatch);
        if (err) { return done(err); }
        if (!isMatch) { return done(null, false); }
        return done(null, user);
      });
    })
    .catch(err => {
      done(err);
    });
});

passport.serializeUser((user, done) => {
  // When we log in or create a new account, we store the users _id in the session
  // console.log('Serialize!');
  done(null, { _id: user._id });
});

passport.deserializeUser((user, done) => {
  // console.log('Deserialize!, query the DB here. This happens on every request');
  User
    .findOne({ _id: user._id })
    .then(updatedUser => done(null, updatedUser))
    .catch(err => done(err));
});

passport.use(localLogin);

exports.login = passport.authenticate('local', {
  failureRedirect: '/login',
  successRedirect: '/',
  failureFlash: 'Failed Login',
  successFlash: 'You are now logged in!',
});
