const express = require('express');
const router = express.Router(); // eslint-disable-line
const storeController = require('../controllers/storeController');
const authController = require('../controllers/authController');
const userController = require('../controllers/userController');
const isLoggedIn = authController.isLoggedIn;
const fakeController = require('../controllers/fakeController');
const reviewController = require('../controllers/reviewController');
const auth = require('../services/passport');
const mail = require('../services/mail');

// const catchErrors = fn => (req, res, next) => fn(req, res, next).catch(next)

function catchErrors(fn) {
  return function(req, res, next) {
    return fn(req, res, next).catch(next);
  }
}

/* Home Page */
router.get('/', storeController.getStores);
router.get('/stores', storeController.getStores);
router.get('/stores/page/:page', storeController.getStores);

router.get('/stores/:slug', catchErrors(storeController.getStoreBySlug));
/* TODO: Must own store before editing */
router.get('/stores/:id/edit', catchErrors(storeController.editStore));
router.get('/map', storeController.mapPage);
router.get('/tags', catchErrors(storeController.getStoresByTag));
router.get('/tags/:tag', storeController.getStoresByTag);
router.get('/top', catchErrors(storeController.getTopStores));
router.get('/hearts', storeController.getHearts);

router.get('/add', isLoggedIn, storeController.addStore);
router.post('/add', isLoggedIn, storeController.upload, storeController.createStore);
router.post('/add/:id', storeController.upload, catchErrors(storeController.updateStore));

/*
  API
*/

/* User Login  */
router.get('/login', userController.loginForm);  /* TODO: Should this be in an auth controller? */
router.post('/login', auth.login);
router.get('/logout', userController.logout);


/* User Account Management */
router.get('/account', isLoggedIn, userController.account);
router.post('/account', isLoggedIn, userController.updateAccount);
router.post('/account/forgot', authController.forgot);
router.get('/account/reset/:token', authController.reset);
router.post('/account/reset/:token', authController.confirmedPassword, authController.update);

/* User Registration */
router.post('/register', userController.validateRegister, userController.register);
router.get('/register', (req, res) => { res.render('register', { title: 'Register' }); });

/* Reviews */
router.post('/reviews/:id', isLoggedIn, reviewController.addReview);

/* Creating fake data */
router.get('/fake/user', isLoggedIn, fakeController.createUsers);
router.get('/fake/store', isLoggedIn, fakeController.createStore);


router.get('/fake/email', (req, res) => {
  mail.sendWelcome();
});

/*
  The API
*/

/* Hearting */
router.post('/api/stores/:id/heart', isLoggedIn, catchErrors(storeController.heartStore));

/* Get the Stores */
router.get('/api/stores/near/', catchErrors(storeController.mapStores));

/* Search */
router.get('/api/search/', storeController.searchStores);

module.exports = router;
