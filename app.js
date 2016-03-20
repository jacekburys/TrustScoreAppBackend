'use strict';

/*
 * Express Dependencies
 */
var express = require('express');
var app = express();
var port = 3030;

/*
 * Use Handlebars for templating
 */
var exphbs = require('express3-handlebars');
var hbs;

// For gzip compression
app.use(express.compress());
var cors = require('cors');
var mongoose = require('mongoose');
var User = require('./models/User');
var Platform = require('./models/Platform');
var Score = require('./models/Score');
mongoose.connect('mongodb://localhost/trustscore');


var passport = require('passport');
var passport_config = require('./config/passport');

var jwt = require('express-jwt');
var auth = jwt({secret: 'SECRET', userPropert: 'payload'});

//CORS middleware to allow us to access different urls in our localhost
app.use(cors());
//Add passport init
app.use(passport.initialize());


/*
 * Config for Production and Development
 */
if (process.env.NODE_ENV === 'production') {
    // Set the default layout and locate layouts and partials
    app.engine('handlebars', exphbs({
        defaultLayout: 'main',
        layoutsDir: 'dist/views/layouts/',
        partialsDir: 'dist/views/partials/'
    }));

    // Locate the views
    app.set('views', __dirname + '/dist/views');
    
    // Locate the assets
    app.use(express.static(__dirname + '/dist/assets'));

} else {
    app.engine('handlebars', exphbs({
        // Default Layout and locate layouts and partials
        defaultLayout: 'main',
        layoutsDir: 'views/layouts/',
        partialsDir: 'views/partials/'
    }));

    // Locate the views
    app.set('views', __dirname + '/views');
    
    // Locate the assets
    app.use(express.static(__dirname + '/assets'));
}

// Set Handlebars
app.set('view engine', 'handlebars');


/*
 * Routes
 */
// Index Page
app.get('/', function(request, response, next) {
    response.render('index');
});

// authentication
app.post('/register', function(req, res, next){
  if(!req.body.username || !req.body.password) {
    return res.status(400).json({message: 'Please fill out all fields'});
  }
  
  var user = new User();

  user.username = req.body.username;

  user.setPassword(req.body.password);

  user.save(function(err) {
    if(err) {return next(err);}
    return res.json({token: user.generateJWT()});
  });
});

app.post('/login', function(req, res, next) {
  if(!req.body.username || !req.body.password) {
    return res.status(400).json({message: 'Please fill out all fields'});
  }

  passport.authenticate('local', function(err, user, info) {
    if(err) {return next(err);}

    if(user) {
      console.log(user.generateJWT());
      return res.json({token: user.generateJWT()})  ;
    } else {
      return res.status(401).json(info);
    }
  })(req, res, next);
});


app.get('/users', function(req, res, next) {
  User.find(function(err, users) {
    if(err) {return next(err);}
    res.json(users);
  });
});


app.param('user_id', function(req, res, next, id) {
  var query = User.findById(id);
  query.exec(function(err,user){
    if(err) { return next(err); }
    if(!user) { return next(new Error('cant find user')); }

    req.user = user;
    return next();
  });
});

app.param('platform_id', function(req, res, next, id) {
  var query = Platform.findById(id);
  query.exec(function(err,platform){
    if(err) { return next(err); }
    if(!platform) { return next(new Error('cant find platform')); }

    req.platform = platform;
    return next();
  });
});

app.param('score_id', function(req, res, next, id) {
  var query = Score.findById(id);
  query.exec(function(err,score){
    if(err) { return next(err); }
    if(!score) { return next(new Error('cant find score')); }

    req.score = score;
    return next();
  });
});

app.get('/user/:user_id', auth, function(req, res, next) {
  res.json(req.user)
});

app.get('/user/scores/:user_id', auth, function(req, res, next){
  var score_ids = req.user.scores;
  var arr = [];
  for(var score_id in score_ids) {
    arr.push(Score.findById(score_id));
  }
  res.json(arr);
});

app.get('/platform/:platform_id', auth, function(req, res, next) {
  res.json(req.platform)
});

app.get('/score/:score_id', auth, function(req, res, next) {
  res.json(req.score);
});

app.get('/platforms', function(req, res, next) {
  Platform.find({}, '_id name', function(err, platforms){
    if(err){return next(err);}
    res.json(platforms);
  });
});

/*
 * Start it up
 */
app.listen(port);
console.log('Express started on port ' + port);
