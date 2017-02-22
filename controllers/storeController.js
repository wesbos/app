const mongoose = require('mongoose');
const Store = mongoose.model('Store');
const User = mongoose.model('User');

const multer = require('multer');
const uuid = require('uuid');

const storage = multer.diskStorage({
  destination(req, file, next) {
    next(null, './public/uploads');
  },
  filename(req, file, next) {
    console.log(file);
    next(null, `${uuid.v4()}-${file.originalname}`);
  }
});

const multerOptions = {
  storage,
  fileFilter(req, file, cb) {
    // TODO only allow jpg and png
    const isPhoto = file.mimetype.match('image/*');
    if (isPhoto) {
      cb(null, true);
    } else {
      return cb('That filetype isn\'t allowed!', false);
    }
  }
};

exports.upload = multer(multerOptions).single('photo');

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
  try {
    const page = req.params.page || 1;
    const limit = 6;
    const skip = (page * limit) - limit;

    const storePromise = Store
      .find()
      .skip(skip)
      .limit(limit)
      .populate('author reviews')
      .sort({ created: 'desc' });

    const countPromise = Store.count();
    const [stores, count] = await Promise.all([storePromise, countPromise]);
    const pages = Math.ceil(count / limit);
    res.render('stores', { stores, title: 'Latest Stores', count, page, pages });
  } catch(err) {
    console.log('eRRRRR!!');
    console.log(err);
    next(err);
  }
};


exports.getStoreBySlug = async (req, res, next) => {
  try {
    const store = await Store.findOne({ slug: req.params.slug }).populate('reviews author');
    if (!store) {
      next(); // not found
      return;
    }
    res.render('store', { store, title: store.name });
  } catch(err) {
    next(err);
  }

};

function isOwner(store, user) {
  return new Promise((resolve, reject) => {
    if (store.author.equals(user._id)) {
      resolve(store); // good
    } else {
      reject({message: 'You must own that store to edit it!'});
    }
  });
}

exports.editStore = async (req, res, next) => {
  try {
    const store = await Store.findOne({ _id: req.params.id });
    await isOwner(store, req.user);
    res.render('editStore', { store, title: 'Edit Store' });
  } catch(err) {
    next(err);
  }
};

exports.createStore = async (req, res, next) => {
  try {
    // TODO: check for file validation error
    req.body.author = req.user._id;
    req.body.photo = req.file && req.file.filename;
    const store = await (new Store(req.body)).save();
    req.flash('success', `Sucessfully Created ${store.name}! Care to leave a review?`);
    res.redirect(`/stores/${store.slug}`);
  } catch(err) {
    if (err.errors) {
      Object.keys(err.errors).forEach(key => req.flash('error', err.errors[key].message));
      res.render('editStore', { store: myStore, flashes: req.flash() });
      return;
    }
    // otherwise pass it on
    next(err);
  }
};

exports.updateStore = (req, res) => {

  if (req.file && req.file.filename) {
    req.body.photo = req.file.filename;
  }
  // default
  req.body.location.type = 'Point';

  Store
    .findOneAndUpdate({ _id: req.params.id }, req.body, { new: true, upsert: true }) // new variable returns the updated document, not the old one!
    .exec()
    .then(store => isOwner(store, req.user))
    .then(store => {
      req.flash('success', `Successfully updated ${store.name}. <a href="/stores/${store.slug}">View Store →</a>`);
      res.redirect(`/stores/${store._id}/edit`);
    })
    .catch(error => res.status(400).json(error));
};

exports.mapStores = (req, res) => {
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

  Store
    .find(q)
    .limit(10)
    .then(stores => res.json(stores))
    .catch(err => res.json(err));
};

exports.mapPage = (req, res) => {
  res.render('map', { title: 'Map' });
};

exports.getStoresByTag = (req, res, next) => {
  const tag = req.params.tag;
  const tagQuery = tag || { $exists: true };

  const storesPromise = Store.find({ tags: tagQuery }).populate('reviews');
  const tagsPromise = Store.getTagsList();

  Promise
    .all([storesPromise, tagsPromise])
    .then(([stores, tags]) => {
      res.render('tag', { tags, stores, tag, title: tag || 'Tags' });
    })
    .catch(next);
};

exports.getTopStores = (req, res, next) => {
  Store
    // Made a Model Method, probably overkill
    .getTopStores(req.params.tag)
    .then(stores => res.render('topStores', { stores, title: '⭐ Top Stores' }))
    .catch(err => {
      next(err);
    });
};

exports.heartStore = (req, res, next) => {
  const hearts = req.user.hearts.map(obj => obj.toString());
  // if it's in the heart, remove it, otherwise add it;
  const operator = hearts.includes(req.params.id) ? '$pull' : '$addToSet';

  User
    .findByIdAndUpdate(req.user._id,
      // Update
      { [operator]: { hearts: req.params.id } },
      // options
      { new: true }
    )
    .then(user => {
      res.json(user);
      // console.log(user);
    })
    .catch(err => {
      next(err);
    });
  console.log(req.user);
  console.log(req.params.id);
};

exports.getHearts = (req, res, next) => {
  Store
    .find({
      _id: { $in: req.user.hearts }
    })
    .populate('author reviews')
    .then(stores => {
      res.render('stores', {
        stores,
        title: 'Hearted Stores'
      });
    })
    .catch(err => next(err));
};

exports.searchStores = (req, res, next) => {
  console.log(req.query.q);
  Store
      .find({ $text: {
        $search: req.query.q
      } },
        { score: { $meta: 'textScore' } }
      )
      .sort({ score: { $meta: 'textScore' } })
      .limit(5)
      .then(stores => {
        res.json(stores);
      })
      .catch(err => next(err));
};
