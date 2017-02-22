module.exports = {
  database: 'mongodb://localhost:27017/caffeine_fix',
  sessionSecret: 'gettinsalty',
  sessionKey: 'sweetsesh',
  baseURI: 'http://localhost:7777',
  secret: 'snickers',
  siteName: 'Now That\'s Delicious!',
  mapKey: 'AIzaSyAddwFzEu83xzv_3kQjwLOrK3d35bmiOKg',
  menu: [
    { slug: '/stores', title: 'Stores', icon: 'store', },
    { slug: '/tags', title: 'Tags', icon: 'tag', },
    { slug: '/top', title: 'Top', icon: 'top', },
    { slug: '/add', title: 'Add', icon: 'add', },
    { slug: '/map', title: 'Map', icon: 'map', },
  ],
  mail: {
    host: 'mailtrap.io',
    port: 2525,
    auth: {
      user: '8545646928be4a',
      pass: 'f051e741aa4c94'
    }
  }
};

