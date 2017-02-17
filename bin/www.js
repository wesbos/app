/*
  NODE_ENV variable fallback as this is a common hurdle for anyone new to node
  Ideally it would be set via the command line in each environment:
  OSX + *nix: export NODE_ENV=production
  WINDOWs: SET NODE_ENV=production
*/
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

const app = require('../app');

app.set('port', process.env.PORT || 7777);

const server = app.listen(app.get('port'), () => {
  console.log(`Express server listening on port http://localhost:${server.address().port}`);
});
