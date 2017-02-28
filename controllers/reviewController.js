const Review = require('../models/Review');

exports.homePage = (req, res) => {
  res.render('index');
};

exports.addReview = async (req, res) => {
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

  await newReview.save();
  res.redirect('back');
};

