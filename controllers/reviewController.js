const Review = require('../models/Review');

exports.homePage = (req, res) => {
  res.render('index');
};

exports.addReview = (req, res) => {
  // check for file validation error
  req.body.author = req.user._id;
  req.body.store = req.params.id;
  console.log(req.body);

  const newReview = new Review({
    author: req.user._id,
    store: req.params.id,
    text: req.body.text,
    rating: req.body.rating,
  });

  newReview
    .save()
    .then((review) => {
      res.format({
        // Based on the `Accept` http header
        'text/html': () => res.redirect('back'), // Form Submit, Reload the page
        'application/json': () => res.json(review) // Ajax call, send JSON back
      });
    })
    .catch(err => res.status(400).json(err));
};

