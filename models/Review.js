const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const reviewSchema = new mongoose.Schema({
  created: {
    type: Date,
    default: Date.now
  },
  author: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: 'You must supply an author when creating a review'
  },
  store: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Store',
    required: 'You must supply a store ID when creating a review'
  },
  text: {
    type: String,
    required: 'A review must contain text!'
  },
  rating: {
    type: Number,
    min: 1,
    max: 5
  },
});

/*
  Auto populate the author field since we need to on every request anyways
*/
function autoPopulate(next) {
  this.populate('author');
  next();
}

reviewSchema.pre('findOne', autoPopulate);
reviewSchema.pre('find', autoPopulate);

module.exports = mongoose.model('Review', reviewSchema);
