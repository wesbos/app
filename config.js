module.exports = {
  siteName: `Now That's Delicious!`,
  database: process.env.DATABASE,
  key: process.env.KEY,
  secret: process.env.SECRET,
  mapKey: process.env.MAP_KEY,
  menu: [
    { slug: '/stores', title: 'Stores', icon: 'store', },
    { slug: '/tags', title: 'Tags', icon: 'tag', },
    { slug: '/top', title: 'Top', icon: 'top', },
    { slug: '/add', title: 'Add', icon: 'add', },
    { slug: '/map', title: 'Map', icon: 'map', },
  ],
  mail: {
    host: process.env.MAIL_HOST,
    port: process.env.MAIL_PORT,
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS
    }
  }
};
