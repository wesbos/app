// pull in passport libs
const passport = require('passport');
const LocalStrategy = require('passport-local');
// user model
const mongoose = require('mongoose');
const User = mongoose.model('User');

passport.use(User.createStrategy());

// use static serialize and deserialize of model for passport session support
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
