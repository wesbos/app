const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const slug = require('slugs');

const storeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: 'Please enter a store name!',
    trim: true
  },
  slug: String,
  location: {
    type: { type: String, default: 'Point' },
    coordinates: [{
      type: Number,
      required: 'You must supply coordinates'
    }],
    address: {
      type: String,
      required: 'You must supply an address'
    }
  },
  created: {
    type: Date,
    default: Date.now
  },
  author: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: 'You must supply an author'
  },
  photo: String,
  description: {
    type: String
  },
  tags: {
    type: [String]
  },
});

// These indexes must be separate
storeSchema.index({ location: '2dsphere' });
// This is called a compound index - they are indexed together
storeSchema.index({ name: 'text', description: 'text' });

/*
  Auto populate the author field since we need to on every request anyways
*/
function autoPopulate(next) {
  this.populate('author');
  next();
}

storeSchema.pre('findOne', autoPopulate);
storeSchema.pre('find', autoPopulate);

/*
  Virtual Fields
*/

// find Reviews where Stores `_id` === Reviews `store`
storeSchema.virtual('reviews', {
  ref: 'Review',
  localField: '_id',
  foreignField: 'store'
});

/*
  Methods
*/
storeSchema.statics.getTopStores = function() {
  return this.aggregate([
    // Note the Schema is called Review, but the collection is called reviews
    { $lookup: {
      from: 'reviews', localField: '_id', foreignField: 'store', as: 'reviews'
    } },
    // filter for only items that have 2 or more reviews
    { $match: {
      'reviews.1': { $exists: true }
    } },
    // Add the average reviews field
    { $addFields: {
      averageRating: { $avg: '$reviews.rating' }
    } },
    // sort it by our new field, highest reviews first
    { $sort: {
      averageRating: -1
    } },
    // limit to at most 10
    { $limit: 10 }
  ]);
};

storeSchema.statics.getTagsList = function() {
  return this.aggregate([
    // unwind, if a store has 2 tags, it will list that store twice
    { $unwind: '$tags' },
    // group by tags
    { $group: { _id: '$tags', count: { $sum: 1 } } },
    // sort by number of tags
    { $sort: { count: -1 } }
  ]);
};

storeSchema.pre('save', function(next) {
  // check if the name has changed
  if (!this.isModified('name')) {
    next();
    return;
  }

  // if it has, update the slug
  this.slug = slug(this.name);
  next();
  // TODO: Make slug unique
});

module.exports = mongoose.model('Store', storeSchema);
