const express = require('express');
const router = express.Router(); // eslint-disable-line
const storeController = require('../controllers/storeController');
const authController = require('../controllers/authController');
const userController = require('../controllers/userController');
const isLoggedIn = authController.isLoggedIn;
const reviewController = require('../controllers/reviewController');
const { catchErrors } = require('../services/errorHandlers');

router.get('/', catchErrors(storeController.getStores));
router.get('/stores', catchErrors(storeController.getStores));
router.get('/stores/page/:page', catchErrors(storeController.getStores));
router.get('/stores/:slug', catchErrors(storeController.getStoreBySlug));
router.get('/stores/:id/edit', catchErrors(storeController.editStore));
router.get('/map', storeController.mapPage);
router.get('/tags', catchErrors(storeController.getStoresByTag));
router.get('/tags/:tag', storeController.getStoresByTag);
router.get('/top', catchErrors(storeController.getTopStores));
router.get('/hearts', catchErrors(storeController.getHearts));
router.get('/add', isLoggedIn, storeController.addStore);
router.post('/add', isLoggedIn, storeController.upload, storeController.createStore);
router.post('/add/:id', storeController.upload, catchErrors(storeController.updateStore));

/* User Login  */
router.get('/login', userController.loginForm);  /* TODO: Should this be in an auth controller? */
router.post('/login', authController.login);
router.get('/logout', userController.logout);

/* User Account Management */
router.get('/account', isLoggedIn, userController.account);
router.post('/account', isLoggedIn, catchErrors(userController.updateAccount));
router.post('/account/forgot', catchErrors(authController.forgot));
router.get('/account/reset/:token', authController.reset);
router.post('/account/reset/:token', authController.confirmedPassword, catchErrors(authController.update));

/* User Registration */
router.post('/register', userController.validateRegister, catchErrors(userController.register), authController.login);
router.get('/register', (req, res) => { res.render('register', { title: 'Register' }); });

/* Reviews */
router.post('/reviews/:id', isLoggedIn, catchErrors(reviewController.addReview));

/*
  The API
*/

/* Hearting */
router.post('/api/stores/:id/heart', isLoggedIn, catchErrors(storeController.heartStore));

/* Get the Stores */
router.get('/api/stores/near/', catchErrors(storeController.mapStores));

/* Search */
router.get('/api/search/', catchErrors(storeController.searchStores));

module.exports = router;
