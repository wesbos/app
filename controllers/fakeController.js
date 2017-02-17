const mongoose = require('mongoose');
const User = mongoose.model('User');
const Store = mongoose.model('Store');
const faker = require('faker');

function createUser() {
  const userData = {
    name: faker.name.findName(),
    email: faker.internet.email(),
    password: faker.internet.password(),
  };
  const user = new User(userData);
  return user.save();
}

function fakeName() {
  const names = ['Aroma Mocha', 'Grinders Cafe', 'Steamy Beans Coffee', 'Baristas', 'Ground Up Cafe', "Tatiana's Cafe", "Beans 'n Cream Cafe", 'HuggaMug Cafe', 'The Busy Bean', 'Beany Business', 'Impresso Espresso', 'The Coffee Club', 'Boston Barista', 'Jacked Up Coffee', 'The Family Bean', 'Club Coffee', "Jumpin' Beans Cafe", 'The Friendly Bean', 'Coffee Express', 'Jumpstart Coffee Shop', 'The Grind', 'Coffee House', 'Lava Java', 'The Hideout', 'Coffee Time', 'Manhattan Mocha', 'The Roasted Bean', "Cup o' Joe", 'Mugs Coffee', 'The Split Bean', 'Dream Bean Coffee Shop', 'No Doze Cafe', 'The Steam Room', 'Espresso Cafe', "Screamin' Beans", 'Topped Off', 'Espresso Express', 'Spiced Chai Cafe', 'Wake Up Cafe', 'Espresso', 'Steam Beans Cafe', 'Wide Awake Cafe', 'Grind House', "Steamin' Mugs", 'Yo Jo Coffee Shop'];
  return names[Math.floor(Math.random() * names.length)];
}

exports.createStore = (req, res) => {
  // first pick a random user from our user DB
  User
    .count()
    .exec()
    .then(count => {
      const randomNumber = Math.floor(Math.random() * count);
      return User.findOne().skip(randomNumber).exec();
    })
    .then(user => {
      const storeData = {
        name: fakeName(),
        location: [faker.address.longitude(), faker.address.latitude()],
        author: user._id,
        description: faker.random.words(100),
        tags: Array(3).fill().map(() => faker.random.word())
      };
      const store = new Store(storeData);
      return store.save();
    })
    .then(store => {
      res.json(store);
    })
    .catch(err => {
      res.json(err);
      console.log(err);
    });
};

exports.createUsers = (req, res) => {
  createUser()
    .then((user) => {
      res.json(user);
    })
    .catch((error) => {
      res.json(error);
    });
};
