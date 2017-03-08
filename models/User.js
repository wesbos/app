const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const md5 = require('md5');
const Schema = mongoose.Schema;
const validator = require('validator');
const mongodbErrorHandler = require('mongoose-mongodb-errors');
const passportLocalMongoose = require('passport-local-mongoose');

// Define our model
const userSchema = new Schema({
  email: {
    type: String,
    unique: true,
    lowercase: true,
    trim: true,
    validate: [validator.isEmail, 'Invalid Email Address'],
    required: 'Please supply an email address'
  },
  name: {
    type: String,
    required: 'You must supply a name',
    trim: true
  },
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  hearts: {
    type: [{ type: mongoose.Schema.ObjectId, ref: 'Store' }],
  }
});

// Virtual fields can be used like regular fields in your templates:
userSchema.virtual('gravatar').get(function () {
  const hash = md5(this.email);
  return `https://www.gravatar.com/avatar/${hash}?s=200`;
});

userSchema.plugin(passportLocalMongoose, { usernameField: 'email' });
userSchema.plugin(mongodbErrorHandler);

// Create + Export the model class
module.exports = mongoose.model('User', userSchema);
