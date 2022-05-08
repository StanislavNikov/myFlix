const express = require('express'),
      morgan = require('morgan'),
      bodyParser = require('body-parser'),
      uuid = require('uuid'),
      mongoose = require('mongoose'),
      cors = require('cors'),
      dotenv = require('dotenv').config(),
      Models = require('./models/models.js'),
      { check, validationResult } = require('express-validator');

console.log(process.env)

const app = express();

const Movies = Models.Movie,
      Users = Models.User,
      Genres = Models.Genre,
      Directors = Models.Director;


/* mongoose.connect('mongodb://localhost:27017/myFlixDB', {useNewUrlParser: true, useUnifiedTopology: true}) */
/* mongoose.connect(process.env.DATABASE_URL, {useNewUrlParser: true, useUnifiedTopology: true}) */
mongoose.connect(process.env.myflixdb, {useNewUrlParser: true, useUnifiedTopology: true})

app.use(morgan('common'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static('public'));

app.use(cors());
/* let allowedOrigins = ['http://localhost:8080', 'http://localhost:1234', 'https://www.imdb.com/']
app.use(cors({
  origin: (origin, callback) => {
    if(!origin) return callback(null, true);
    if(allowedOrigins.indexOf(origin) === -1) {
      let message = "The CORS policy for this application doesn't allow origin " + origin;
      return callback(new Error(message ), false);
    }
    return callback(null, true);
  }
})); */

let auth = require('./auth')(app);
const passport = require('passport');
require('./passport');

let movies = [];
let users = [];

app.get('/', (req, res) => {

 /*  let documentation = document.createElement('a');
  let link = document.createTextNode("https://myflixxxdb.herokuapp.com/documentation");
  documentation.title = "https://myflixxxdb.herokuapp.com/documentation";
  documentation.href = "https://myflixxxdb.herokuapp.com/documentation";
  documentation.appendChild(link); */
  
  /*  function link(text, href, escape = true) {
    return html`<a href="${href}">${escape ? DOM.text(text) : text}`;
  } */ 

  /* link = (text, href) => {
    const link = DOM.element('a', { href })
    link.textContent = text
    return link
  } */

  res.send('Wellcome to myFlix - your movie app of choice!\n\n\nHere you can check out the documentation page: https://myflixxxdb.herokuapp.com/documentation');
});


// READ // Gets ALL movies
app.get('/movies',/*  passport.authenticate('jwt', { session: false }), */ (req, res) => {
  Movies.find()
  .then((movies) => res.status(200).json(movies))
  .catch((err) => {
    console.error(err);
    res.status(500).send('Error: ' + err)
  });  
});


// READ // Gets ALL Genres
app.get('/genres', passport.authenticate('jwt', { session: false }), (req, res) => {
  Genres.find()
  .then((genres) => res.status(200).json(genres))
  .catch((err) => {
    console.error(err);
    res.status(500).send('Error: ' + err)
  });  
});


// READ // Gets ALL Directors
app.get('/directors', passport.authenticate('jwt', { session: false }), (req, res) => {
  Directors.find()
  .then((directors) => res.status(200).json(directors))
  .catch((err) => {
    console.error(err);
    res.status(500).send('Error: ' + err)
  });  
});


// READ // Gets A Single Movie
app.get('/movies/:Title', passport.authenticate('jwt', { session: false }), (req, res) => {
  Movies.findOne( { Title: req.params.Title } )
  .then((movie) => {
    if(!movie) {
      res.status(400).send(req.params.Title + ' was not found!')
    } else {
      res.status(200).json(movie);
    }
  })      
  .catch((err) => {
    console.error(err);
    res.status(500).send('Error: ' + err)
  });
});


// READ // Gets data about a 'Genre' by Name
app.get('/genres/:Name', passport.authenticate('jwt', { session: false }), (req, res) => {
  Genres.findOne( { Name: req.params.Name } )
  .then((genre) => {
    if(!genre) { 
      res.status(400).send(req.params.Name + " doesn't exist!");
    } else {
      res.status(200).json(genre);
    }
  })
  .catch((err) => {
    console.error(err);
    res.status(500).send('Error: ' + err);
  });
});


// READ // Gets data about a 'Director' by Name
app.get('/directors/:Name', passport.authenticate('jwt', { session: false }), (req, res) => {
  Directors.findOne( {Name: req.params.Name} )
  .then((director) => {
    if(!director) {
      res.status(400).send(req.params.Name + " doesn't exist!");
    } else {
      res.status(200).json(director);
    }
  })
  .catch((err) => {
    console.error(err);
    res.status(500).send('Error: ' + err);
  });
});


// READ // Get a User by Username
app.get('/users/:Username', /* passport.authenticate('jwt', { session: false }), */ (req, res) => {
  Users.findOne( { Username: req.params.Username } )
  .then((user) => {
    if(!user) {
      res.status(400).send(req.params.Username + " doesn't exist!");
    } else {
      res.status(200).json(user);
    }
  })
  .catch((err) => {
    console.error(err);
    res.status(500).send('Error: ' + err);
  });
});


// CREATE // Posts a new User
app.post('/users', 
  [
   check('Username', 'Username has to consist of at least 5 alphanumeric characters.').isLength({min: 5}),
   check('Username', 'Username contains non-alphanumeric characters, which is not allowed.').isAlphanumeric(),
   check('Password', 'Password is required').not().isEmpty(),
   check('Email', 'Email does not appear to be valid.').isEmail()
  ], (req, res) => {
  // checking the validation object for errors
  let errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() })
  }

  let hashedPassword = Users.hashPassword(req.body.Password);

  Users.findOne( { Username: req.body.Username } )
  .then((user) => {
    if(user) {
      return res.status(400).send(req.body.Username + ' already exists!');
    } else {
      Users
        .create({
          Username: req.body.Username,
          Password: hashedPassword,
          Email: req.body.Email,
          Birthdate: req.body.Birthdate
        })
        .then((user) => res.status(201).json(user))
        .catch((err) => {
          console.error(err);
          res.status(500).send('Error: ' + err);
      });
    }
  });
});


// DELETE // Deleting an existing user 
app.delete('/users/:Username', passport.authenticate('jwt', { session: false }), (req, res) => {

  Users.findOneAndRemove( { Username: req.params.Username} )
  .then((user) => {
    if(!user) {
      res.status(400).send(req.params.Username + ' was not found');
    } else {
      res.status(200).send(req.params.Username + ' was deleted.');
    }
  })
  .catch((err) => {
    console.error(err);
    res.status(500).send('Error: ' + err)
  });  
});
 

// CREATE // Post a movie to user's "Favoruite movies" array by MovieID
app.post('/users/:Username/movies/:MovieID', passport.authenticate('jwt', { session: false }), (req, res) => {

  Users.findOneAndUpdate( { Username: req.params.Username} ,
  { $push: { "Favourite movies": req.params.MovieID } },
  { new: true },
  (err, updatedUser) => {
    if(err) {
      console.error(err);
      res.status(500).send('Error: ' + err);
    } else { 
      res.status(200).send(req.params.MovieID + ' was successfully added.')
    }
  });
});


// DELETE // Deleting a movie from user's "Favoruite movies" array by MovieID
app.delete('/users/:Username/movies/:MovieID', passport.authenticate('jwt', { session: false }), (req, res) => {

  Users.findOneAndUpdate( { Username: req.params.Username},
    { $pull: { "Favourite movies": req.params.MovieID } },
    { new: true },
    (err, updatedUser) => {
      if(err) {
        console.error(err);
        res.status(500).send('Error: ' + err);
      } else {
        res.json(updatedUser);
      }
    });
});


// UPDATE // Updating User info
app.put('/users/:Username', 
[
 check('Username', 'Username has to consist of at least 5 alphanumeric characters.').isLength({min: 5}),
 check('Username', 'Username contains non-alphanumeric characters, which is not allowed.').isAlphanumeric(),
 check('Password', 'Password is required').not().isEmpty(),
 check('Email', 'Email does not appear to be valid.').isEmail()
], passport.authenticate('jwt', { session: false }), (req, res) => {
  let errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() })
  }

  let hashedPassword = Users.hashPassword(req.body.Password);

  Users.findOneAndUpdate({ Username: req.params.Username},
    { $set:
      {
        Username: req.body.Username,
        Password: hashedPassword,
        Email: req.body.Email,
        Birthdate: req.body.Birthdate
      }
  },
  { new: true }, // This line makes sure that the updated document is returned
  (err, updatedUser) => {
    if(err) {
      console.error(err);
      res.status(500).send('Error: ' + err);
    } else {
      res.json(updatedUser);
    }
  });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!')
})

const port = process.env.PORT || 8080;
app.listen(port, '0.0.0.0', () => {
  console.log('Your app is listening on port ' + port);
});
