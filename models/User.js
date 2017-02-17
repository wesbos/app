const mongoose = require('mongoose');
const md5 = require('md5');
const Schema = mongoose.Schema;
const bcrypt = require('bcrypt-nodejs');
const validator = require('validator');
const uniqueValidator = require('mongoose-unique-validator');

// Define our model
const userSchema = new Schema({
  email: {
    type: String,
    unique: [true, 'Email Address Already in use'],
    lowercase: true,
    trim: true,
    validate: [validator.isEmail, 'Invalid Email Address'],
    required: 'Please supply an email address'
  },
  password: { type: String, select: false }, // select will stop the password from being returned unless we explicitly ask for it
  name: {
    type: String,
    required: 'You must supply a name',
    trim: true,
  },
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  admin: {
    type: Boolean,
    default: false
  },
  hearts: {
    type: [{ type: mongoose.Schema.ObjectId, ref: 'Store' }]
  }
});

// on save hook, encrypt password
userSchema.pre('save', function(next) {
  // only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) return next();

  bcrypt.genSalt(10, (err, salt) => {
    if (err) { return next(err); }

    bcrypt.hash(this.password, salt, null, (err, hash) => {
      if (err) { return next(err); }
      this.password = hash;
      next();
    });
  });
});

userSchema.methods.comparePassword = function(candidatePassword, callback) {
  bcrypt.compare(candidatePassword, this.password, (err, isMatch) => {
    if (err) { return callback(err); }
    callback(null, isMatch);
  });
};

// Virtual fields can be used like regular fields in your templates:
userSchema.virtual('gravatar').get(function () {
  const hash = md5(this.email);
  return `https://www.gravatar.com/avatar/${hash}?s=200`;
});

userSchema.plugin(uniqueValidator, { message: '{PATH} must be unique' });

// Create + Export the model class
module.exports = mongoose.model('User', userSchema);
