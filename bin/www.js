// import envionmental variables from our variables.env file

require('dotenv').config({ path: 'variables.env' });
const app = require('../app');

app.set('port', process.env.PORT || 7777);

const server = app.listen(app.get('port'), () => {
  console.log(`Express server listening on port ${server.address().port}`);
});
