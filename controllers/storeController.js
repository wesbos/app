const mongoose = require('mongoose');
const Store = mongoose.model('Store');
const User = mongoose.model('User');
const sharp = require('sharp');
const multer = require('multer');
const uuid = require('uuid');

const multerOptions = {
  storage: multer.memoryStorage(),
  fileFilter(req, file, cb) {
    const isPhoto = file.mimetype.startsWith('image/*');
    if (isPhoto) {
      cb(null, true);
    } else {
      return cb({message: 'That filetype isn\'t allowed!'}, false);
    }
  }
};

exports.upload = multer(multerOptions).single('photo');

exports.resize = async (req, res, next) => {
  const extension = req.file.mimetype.split('/')[1];
  req.file.fileName = `${uuid.v4()}.${extension}`;
  const photo = await sharp(req.file.buffer).resize(800).toFile(`./public/uploads/${req.file.fileName}`);
  next();
};

exports.createStore = async (req, res, next) => {
  req.body.author = req.user._id;
  req.body.photo = req.file && req.file.fileName;
  const store = await (new Store(req.body)).save();
  req.flash('success', `Sucessfully Created ${store.name}! Care to leave a review?`);
  res.redirect(`/stores/${store.slug}`);
};

exports.homePage = (req, res) => {
  res.render('index');
};

/*
  visiting the /add page
*/
exports.addStore = (req, res) => {
  res.render('editStore', { title: 'Add Store' });
};

exports.getStores = async (req, res, next) => {
  const page = req.params.page || 1;
  const limit = 6;
  const skip = Math.max((page * limit) - limit, 0);

  const storePromise = Store
    .find()
    .skip(skip)
    .limit(limit)
    .populate('author reviews')
    .sort({ created: 'desc' });

  const countPromise = Store.count();
  const [stores, count] = await Promise.all([storePromise, countPromise]);
  const pages = Math.ceil(count / limit);
  if (!stores.length && skip) {
    req.flash('info', `HEY - you asked for page ${page}. I put ya on page ${pages}`);
    res.redirect(`/stores/page/${pages}`);
    return;
  }
  res.render('stores', { stores, title: 'Latest Stores', count, page, pages });
};


exports.getStoreBySlug = async (req, res, next) => {
  const store = await Store.findOne({ slug: req.params.slug }).populate('reviews author');
  if (!store) return next();
  res.render('store', { store, title: store.name });
};

const confirmOwner = (store, user) => {
  if (!store.author.equals(user._id)) {
    throw Error('You must own a store in order to edit it!');
  }
};

exports.editStore = async (req, res, next) => {
  const store = await Store.findOne({ _id: req.params.id });
  confirmOwner(store, req.user); // check if they are an owner
  res.render('editStore', { store, title: 'Edit Store' });
};

exports.updateStore = async (req, res) => {
  if (req.file && req.file.filename) {
    req.body.photo = req.file.filename;
  }
  // default
  req.body.location.type = 'Point';

  // TODO: Catch validation errors and re-render
  const store = await Store
    .findOneAndUpdate({ _id: req.params.id }, req.body, { new: true, upsert: true, runValidators: true }) // new variable returns the updated document, not the old one!
    .exec();
  confirmOwner(store, req.user);
  req.flash('success', `Successfully updated ${store.name}. <a href="/stores/${store.slug}">View Store →</a>`);
  res.redirect(`/stores/${store._id}/edit`);
};

exports.mapStores = async (req, res) => {
  const coordinates = [req.query.lng, req.query.lat].map(parseFloat);
  const q = {
    location: {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates
        },
        $maxDistance: 10000 // 10km
      }
    }
  };

  const stores = await Store.find(q).limit(10);
  res.json(stores);
};

exports.mapPage = (req, res) => {
  res.render('map', { title: 'Map' });
};

exports.getStoresByTag = async (req, res, next) => {
  const tag = req.params.tag;
  const tagQuery = tag || { $exists: true };

  const storesPromise = Store.find({ tags: tagQuery }).populate('reviews');
  const tagsPromise = Store.getTagsList();

  const [stores, tags] = await Promise.all([storesPromise, tagsPromise]);
  res.render('tag', { tags, stores, tag, title: tag || 'Tags' });
};

exports.getTopStores = async (req, res, next) => {
  const stores = await Store.getTopStores(req.params.tag);
  res.render('topStores', { stores, title: '⭐ Top Stores' });
};

exports.heartStore = async (req, res, next) => {
  const hearts = req.user.hearts.map(obj => obj.toString());
  // if it's in the heart, remove it, otherwise add it;
  const operator = hearts.includes(req.params.id) ? '$pull' : '$addToSet';
  const user = await User
    .findByIdAndUpdate(req.user._id,
      // Update
      { [operator]: { hearts: req.params.id } },
      // options
      { new: true }
    );
  res.json(user);
};

exports.getHearts = async (req, res, next) => {
  const stores = await Store.find({
    _id: { $in: req.user.hearts }
  })
  .populate('author reviews');

  res.render('stores', { stores, title: 'Hearted Stores' });
};

exports.searchStores = async (req, res, next) => {
  const stores = await Store
    .find({ $text: {
      $search: req.query.q
    } },
      { score: { $meta: 'textScore' } }
    )
    .sort({ score: { $meta: 'textScore' } })
    .limit(5);

  res.json(stores);
};
