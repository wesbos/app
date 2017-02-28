const express = require('express');
const session = require('express-session');
const fs = require('fs');
const mongoose = require('mongoose');
const MongoStore = require('connect-mongo')(session);
fs.readdirSync('./models').forEach(file => require(`./models/${file}`)); // eslint-disable-line
const path = require('path');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const passport = require('passport');
const promisify = require('es6-promisify');
const flash = require('connect-flash');
const expressValidator = require('express-validator');
const routes = require('./routes/index');
const helpers = require('./helpers');
const config = require('./config');
const errorHandlers = require('./services/errorHandlers');
// create our Express app
const app = express();

// DB Connect
mongoose.connect(config.database);
// If the connection is bad, let the dev know
mongoose.connection.on('error', (err) => {
  console.error(`🙅 🚫 🙅 🚫 🙅 🚫 🙅 🚫 → ${err.message}`);
});

mongoose.Promise = global.Promise; // only once because it's a singleton
// mongoose.set('debug', true);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(expressValidator());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
  secret: config.secret,
  key: config.key,
  resave: false,
  saveUninitialized: false,
  store: new MongoStore({ mongooseConnection: mongoose.connection })
}));

app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

// pass variables to our templates + all requests
app.use((req, res, next) => {
  res.locals.h = helpers;
  res.locals.flashes = req.flash();
  res.locals.user = req.user || null;
  res.locals.currentPath = req.path;
  res.locals.config = config;
  next();
});

// promisify some callback based APIs
app.use((req, res, next) => {
  req.login = promisify(req.login, req);
  next();
});


app.use('/', routes);

// catch 404 and forward to error handler
app.use(errorHandlers.notFound);

app.use(errorHandlers.displayFlashes);

if (app.get('env') === 'development') {
  /* Development Error Handler - Prints stack trace */
  app.use(errorHandlers.developmentErrors);
}

// production error handler
app.use(errorHandlers.developmentErrors);

module.exports = app;
