const createError = require('http-errors');
const express = require('express');
var app = express();
const session = require('express-session')
const FileStore = require('session-file-store')(session)
const bodyParser = require('body-parser');
const path = require('path');
const db = require('./lib/db');
const logger = require('morgan');
const flash = require('connect-flash');
const compression = require('compression');
const helmet = require('helmet')
app.use(logger('dev'));
app.use(flash());
app.use(compression());
app.use(helmet());

//setups
app.use(express.static('public'));
app.use(express.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(session({
    secret: 'qwerty!@#$%^&*',
    resave: false,
    saveUninitialized: true,
    store: new FileStore()
}))

//passport and req.list setup
var passport = require('./lib/passport')(app);
app.get('*', function (req, res, next) {
  db.query('SELECT * FROM content', function (err, result){
    if (err) throw err;
    else {
        req.list = result;
        next();
    }
  });
});

// jade view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

//router setup
var indexRouter = require('./routes/index');
    app.use('/', indexRouter);
var contentRouter = require('./routes/content');
    app.use('/content', contentRouter);
var authRouter = require('./routes/auth')(passport);
    app.use('/auth', authRouter);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
    next(createError(404));
});
  
// error handler
app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

app.listen(3000, function () {
    console.log('http://localhost:3000/ initiated')
});
