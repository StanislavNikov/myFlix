const express = require('express'),
      morgan = require('morgan'),
      bodyParser = require('body-parser'),
      uuid = require('uuid'),
      mongoose = require('mongoose'),
      cors = require('cors'),
      Models = require('./models/models.js'),
      { check, validationResult } = require('express-validator');

const app = express();

const Movies = Models.Movie,
      Users = Models.User,
      Genres = Models.Genre,
      Directors = Models.Director;

/* mongoose.connect('mongodb://localhost:27017/myFlixDB', {useNewUrlParser: true, useUnifiedTopology: true}) */
mongoose.connect(process.env.myflixdb, {useNewUrlParser: true, useUnifiedTopology: true})

app.use(morgan('common'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static('public'));

let allowedOrigins = ['http://localhost:8080']
app.use(cors({
  origin: (origin, callback) => {
    if(!origin) return callback(null, true);
    if(allowedOrigins.indexOf(origin) === -1) {
      let message = "The CORS policy for this application doesn't allow origin " + origin;
      return callback(new Error(message ), false);
    }
    return callback(null, true);
  }
}));

let auth = require('./auth')(app);
const passport = require('passport');
require('./passport');

let movies = [
  {
    "Title": "Star Wars",
    "Description": "Luke Skywalker joins forces with a Jedi Knight, a cocky pilot, a Wookiee and two droids to save the galaxy from the Empire's world-destroying battle station, while also attempting to rescue Princess Leia from the mysterious Darth Vader.",
    "Genre": {
      "Name": "Science fiction",
      "Definition": "Also known as Sci-Fi, these are fictional stories based on science. They can be about the future or other worlds, and often include spaceships, extra-terrestrial beings (aliens), and advanced technology we don't currently have."
    },
    "Director": {
      "Name": "George Lucas",
      "Biography": "Director George Lucas is an American filmmaker and writer. He studied cinematography at the University of Southern California and caught the eye of Francis Ford Coppola, who helped him enter the film business. Lucas is best known for writing and directing Star Wars and creating the Indiana Jones series, as well as founding the Industrial Light & Magic special effects company.",
      "Date of birth": "May 14, 1944"
    },
    "ImageURL": "https://www.imdb.com/title/tt0076759/mediaviewer/rm3263717120/",
    "Featured": true
  },

  {
    "Title": "A Clockwork Orange",
    "Description": "In the future, a sadistic gang leader is imprisoned and volunteers for a conduct-aversion experiment, but it doesn't go as planned.",
    "Genre": {
      "Name": "Science fiction",
      "Definition": "Also known as Sci-Fi, these are fictional stories based on science. They can be about the future or other worlds, and often include spaceships, extra-terrestrial beings (aliens), and advanced technology we don't currently have."
    },
    "Director": {
      "Name": "Stanley Kubrick",
      "Biography": "Born in New York City on July 26, 1928, Stanley Kubrick worked as a photographer for Look magazine before exploring filmmaking in the 1950s. He went on to direct a number of acclaimed films, including Spartacus (1960), Lolita (1962), Dr. Strangelove (1964), A Clockwork Orange (1971), 2001: A Space Odyssey (1968), The Shining (1980), Full Metal Jacket (1987) and Eyes Wide Shut (1999). Kubrick died in England on March 7, 1999.",
      "Date of birth": "July 26, 1928"
    },
    "ImageURL": "https://www.imdb.com/title/tt0066921/mediaviewer/rm1351407872/",
    "Featured": true
  },

  {
    "Title": "The Matrix",
    "Description": "When a beautiful stranger leads computer hacker Neo to a forbidding underworld, he discovers the shocking truth - the life he knows is the elaborate deception of an evil cyber-intelligence.",
    "Genre": {
      "Name": "Science fiction",
      "Definition": "Also known as Sci-Fi, these are fictional stories based on science. They can be about the future or other worlds, and often include spaceships, extra-terrestrial beings (aliens), and advanced technology we don’t currently have."
    },
    "Director": {
      "Name": "Larry Wachowski / Andy Wachowski",
      "Biography": "Lana Wachowski and her sister Lilly Wachowski, also known as the Wachowskis, are the duo behind such ground-breaking movies as The Matrix (1999) and Cloud Atlas (2012). Born to mother Lynne, a nurse, and father Ron, a businessman of Polish descent, Wachowski grew up in Chicago and formed a tight creative relationship with her sister Lilly. After the siblings dropped out of college, they started a construction business and wrote screenplays. Their 1995 script, Assassins (1995), was made into a movie, leading to a Warner Bros contract. After that time, the Wachowskis devoted themselves to their movie careers. In 2012, during interviews for Cloud Atlas and in her acceptance speech for the Human Rights Campaign's Visibility Award, Lana spoke about her experience of being a transgender woman, sacrificing her much cherished anonymity out of a sense of responsibility. Lana is known to be extremely well-read, loves comic books and exploring ideas of imaginary worlds, and was inspired by Stanley Kubrick's 2001: A Space Odyssey (1968) in creating Cloud Atlas.",
      "Date of birth": "June 21, 1965 / December 29, 1967"
    },
    "ImageURL": "https://www.imdb.com/title/tt0133093/mediaviewer/rm525547776/",
    "Featured": true
  },

  {
    "Title": "The Holy Mountain",
    "Description": "In a corrupt, greed-fueled world, a powerful alchemist leads a messianic character and seven materialistic figures to the Holy Mountain, where they hope to achieve enlightenment.",
    "Genre": {
      "Name": "Fantasy",
      "Definition": "Situations, places and/or events that don't comply with natural laws or settings. They often involve some form of magic or supernatural elements. There are sometimes magical creatures or beings too."
    },
    "Director": {
      "Name": "Alejandro Jodorowsky",
      "Biography": "Alejandro Jodorowsky Prullansky (born 17 February 1929) is a Chilean filmmaker, playwright, author, actor, and psychotherapist. He is most famous for his avant-garde films, such as 'El Topo' and 'The Holy Mountain'.",
      "Date of birth": "February 17, 1929"
    },
    "ImageURL": "https://www.imdb.com/title/tt0071615/mediaviewer/rm3911191040/",
    "Featured": true
  },

  {
    "Title": "Waking Life",
    "Description": "A man shuffles through a dream, meeting various people and discussing the meanings and purposes of the universe.",
    "Genre": {
      "Name": "Fantasy",
      "Definition": "Situations, places and/or events that don't comply with natural laws or settings. They often involve some form of magic or supernatural elements. There are sometimes magical creatures or beings too."
    },
    "Director": {
      "Name": "Richard Linklater",
      "Biography": "Self-taught writer-director Richard Stuart Linklater was born in Houston, Texas, to Diane Margaret (Krieger), who taught at a university, and Charles W. Linklater III. Richard was among the first and most successful talents to emerge during the American independent film renaissance of the 1990s. Typically setting each of his movies during one 24-hour period, Linklater's work explored what he dubbed 'the youth rebellion continuum', focusing in fine detail on generational rites and mores with rare compassion and understanding while definitively capturing the 20-something culture of his era through a series of nuanced, illuminating ensemble pieces which introduced any number of talented young actors into the Hollywood firmament. Born in Houston, Texas, Linklater suspended his educational career at Sam Houston State University in 1982, to work on an offshore oil rig in the Gulf of Mexico. He subsequently relocated to the state's capital of Austin, where he founded a film society and began work on his debut film, 1987's It's Impossible to Learn to Plow by Reading Books (1988). Three years later he released the sprawling Slacker (1990), an insightful, virtually plotless look at 1990s youth culture that became a favorite on the festival circuit prior to earning vast acclaim at Sundance in 1991. Upon its commercial release, the movie, made for less than $23,000, became the subject of considerable mainstream media attention, with the term 'slacker' becoming a much-overused catch-all tag employed to affix a name and identity to America's disaffected youth culture.",
      "Date of birth": "July 30, 1960"
    },
    "ImageURL": "https://www.imdb.com/title/tt0243017/mediaviewer/rm3365810432/",
    "Featured": true
  },

  {
    "Title": "Zeitgeist: The Movie",
    "Description": "Mythology and belief in society today, presenting uncommon perspectives of common cultural issues.",
    "Genre": {
      "Name": "Documentary",
      "Definition": "A practice of filmmaking that deals with actual and factual (and usually contemporary) issues, institutions, and people; whose purpose is to educate, inform, communicate, persuade, raise consciousness, or satisfy curiosity; in which the viewer is commonly addressed as a citizen of a public sphere; whose materials are selected and arranged from what already exists (rather than being made up); and whose methods involve filming 'real people' as themselves in actual locations, using natural light and ambient sound. Although filmmaking of this type dates to the earliest years of cinema (see actualities; travel film), the term documentary was not coined until the 1920s, when the founder of the British Documentary Movement, John Grierson, defined it as 'the creative treatment of actuality'."
    },
    "Director": {
      "Name": "Peter Joseph",
      "Biography": "Peter Joseph (Winston-Salem, NC, USA) inadvertently became globally acclaimed after a private performance work called 'Zeitgeist' went viral online in 2007. This highly controversial art piece was artlessly placed online after a short performance run in Manhattan. Peter is/was a solo percussionist/electronic musician and originally produced 'Zeitgeist' as a performance, not a 'film'. Afterwards 'Zeitgeist' became 'Zeitgeist: The Movie', with over 50 million+ online views counted in the first year alone via Google Video, Peter went on to produce 2 sequels ('Zeitgeist: Addendum' and 'Zeitgeist: Moving Forward') to that work, each achieving a similar level of viral attention. It is estimated that combined, well over 350 million people have seen one or more of his three documentaries since 2007. Apart from his film and music work, Peter is a dedicated activist and has lectured around the world, including the UK, Canada, America, Brazil, Germany & Israel, on subjects of cultural/social sustainability, the importance of critical thought, and the social role of the arts and scientific literacy. He has been profiled in the New York Times, The Huffington Post, The Marker, Free Speech TV, The Young Turks, Hollywood Today and many other outlets. He has participated in multiple TEDx Events, has worked with The Global Summit and is also a frequent social/economic critic on the news network Russia Today.",
      "Date of birth": "February 4, 1979"
    },
    "ImageURL": "https://www.imdb.com/title/tt1166827/mediaviewer/rm3788871168/",
    "Featured": false
  },

  {
    "Title": "Salò, or the 120 Days of Sodom (Salò o le 120 giornate di Sodoma)",
    "Description": "In World War II Italy, four fascist libertines round up nine adolescent boys and girls and subject them to 120 days of physical, mental, and sexual torture.",
    "Genre": {
      "Name": "Drama",
      "Definition": "These films are serious and focus on the emotions of realistic characters and the conflicts they have."
    },
    "Director": {
      "Name": "Pier Paolo Pasolini",
      "Biography": "Pier Paolo Pasolini achieved fame and notoriety long before he entered the film industry. A published poet at 19, he had already written numerous novels and essays before his first screenplay in 1954. His first film Accattone (1961) was based on his own novel and its violent depiction of the life of a pimp in the slums of Rome caused a sensation. He was arrested in 1962 when his contribution to the portmanteau film Ro.Go.Pa.G. (1963) was considered blasphemous and given a suspended sentence. It might have been expected that his next film, The Gospel According to Matthew (1964) (The Gospel According to St. Matthew), which presented the Biblical story in a totally realistic, stripped-down style, would cause a similar fuss but, in fact, it was rapturously acclaimed as one of the few honest portrayals of Christ on screen. Its original Italian title pointedly omitted the Saint in St. Matthew). Pasolini's film career would then alternate distinctly personal and often scandalously erotic adaptations of classic literary texts: Oedipus Rex (1967) (Oedipus Rex); The Decameron (1971); The Canterbury Tales (1972) (The Canterbury Tales); Arabian Nights (1974) (Arabian Nights), with his own more personal projects, expressing his controversial views on Marxism, atheism, fascism and homosexuality, notably Theorem (1968) (Theorem), Pigsty and the notorious Salò, or the 120 Days of Sodom (1975), a relentlessly grim fusion of Benito Mussolini's Fascist Italy with the 'Marquis de Sade' which was banned in Italy and many other countries for several years. Pasolini was murdered in still-mysterious circumstances shortly after completing the film.",
      "Date of birth": "November 2, 1975"
    },
    "ImageURL": "https://www.imdb.com/title/tt0073650/mediaviewer/rm3704080897/",
    "Featured": true
  },

  {
    "Title": "Lost Highway",
    "Description": "Anonymous videotapes presage a musician's murder conviction, and a gangster's girlfriend leads a mechanic astray.",
    "Genre": {
      "Name": "Mystery",
      "Definition": "Mystery is a genre whose stories/plots focus on a puzzling crime, situation, or circumstance that needs to be solved. The term comes from the Latin mysterium, meaning “a secret thing.” stories can be either fictional or nonfictional, and can focus on both supernatural and non-supernatural topics. Many mystery stories involve what is called a 'whodunit' scenario, meaning the mystery revolves around the uncovering a culprit or criminal."
    },
    "Director": {
      "Name": "David Lynch",
      "Biography": "Born in 1946 in Missoula, Montana, David Lynch was raised in small-town America. After high school, he went to Boston to attend the School of the Museum of Fine Arts. Shortly after that, he planned a three-year trip to Europe to work on his art, but didn't take to it and left after 15 days. In 1977, he released his first film Eraserhead (1977), which, although not critically acclaimed, was noticed by many people, including Francis Ford Coppola, who was rumored to have screenings of it for his cast and crew on the Apocalypse Now (1979) set. After a stream of visually striking films such as Blue Velvet (1986), Lost Highway (1997) and Mulholland Drive (2001). These films and others, beginning with Blue Velvet (1986), and including his Twin Peaks (1990) T.V. series, feature what has now been added to signature Lynch features, such as vibrant colors, the use of dreams and montage to connect character thought and multiple emotions into one sequence. In addition to that, since Blue Velvet (1986), Lynch has gained the reputation of one of the foremost auteurs in the film industry, and one of the few living auteurs who continually defies cinematic convention. His films continually represent his ideal that films, representing life, should be complex, and in some cases, inexplicable. Due to his decisive innovation and the beautiful confusion of his films, he will always be recognized as if not one of the greatest film-makers, one of the most original. Lynch is an innovative director, and even if his films aren't necessarily realistic, they are real in their representation of what life is: a confusing, irrational series of events that have little purpose, and one makes one's own interpretation of each event, giving life one's own purpose. Lynch wants his films to resonate emotionally and instinctively, and for every person to relate and find its own understanding. As he said, 'Life is very, very confusing, and so films should be allowed to be, too'. David Lynch is original. He has done things in film-making that D.W. Griffith did in his day. David Lynch will never stop making beauty on the screen.",
      "Date of birth": "January 20, 1946"
    },
    "ImageURL": "https://www.imdb.com/title/tt0116922/mediaviewer/rm3025737728/",
    "Featured": true
  },

  {
    "Title": "Seven Samurai (Shichinin no samurai)",
    "Description": "A poor village under attack by bandits recruits seven unemployed samurai to help them defend themselves.",
    "Genre": {
      "Name": "Drama",
      "Definition": "These films are serious and focus on the emotions of realistic characters and the conflicts they have."
    },
    "Director": {
      "Name": "Akira Kurosawa",
      "Biography": "After training as a painter (he storyboards his films as full-scale paintings), Kurosawa entered the film industry in 1936 as an assistant director, eventually making his directorial debut with Sanshiro Sugata (1943). Within a few years, Kurosawa had achieved sufficient stature to allow him greater creative freedom. Drunken Angel (1948) was the first film he made without extensive studio interference, and marked his first collaboration with Toshirô Mifune. In the coming decades, the two would make 16 movies together, and Mifune became as closely associated with Kurosawa's films as was John Wayne with the films of Kurosawa's idol, John Ford. After working in a wide range of genres, Kurosawa made his international breakthrough film Rashomon (1950) in 1950. It won the top prize at the Venice Film Festival, and first revealed the richness of Japanese cinema to the West. The next few years saw the low-key, touching Ikiru (1952) (Living), the epic Seven Samurai (1954), the barbaric, riveting Shakespeare adaptation Throne of Blood (1957), and a fun pair of samurai comedies Yojimbo (1961) and Sanjuro (1962). After a lean period in the late 1960s and early 1970s, though, Kurosawa attempted suicide. He survived, and made a small, personal, low-budget picture with Dodes'ka-den (1970), a larger-scale Russian co-production Dersu Uzala (1975) and, with the help of admirers Francis Ford Coppola and George Lucas, the samurai tale Kagemusha (1980), which Kurosawa described as a dry run for Ran (1985), an epic adaptation of Shakespeare's 'King Lear.' He continued to work into his eighties with the more personal Dreams (1990), Rhapsody in August (1991) and Mādadayo (1993). Kurosawa's films have always been more popular in the West than in his native Japan, where critics have viewed his adaptations of Western genres and authors (William Shakespeare, Fyodor Dostoevsky, Maxim Gorky and Evan Hunter) with suspicion - but he's revered by American and European film-makers, who remade Rashomon (1950) as The Outrage (1964), Seven Samurai (1954), as The Magnificent Seven (1960), Yojimbo (1961), as A Fistful of Dollars (1964) and The Hidden Fortress (1958), as Star Wars: Episode IV - A New Hope (1977).",
      "Date of birth": "March 23, 1910"
    },
    "ImageURL": "https://www.imdb.com/title/tt0047478/mediaviewer/rm2518563840/",
    "Featured": true
  },

  {
    "Title": "Midsommar",
    "Description": "A couple travels to Northern Europe to visit a rural hometown's fabled Swedish mid-summer festival. What begins as an idyllic retreat quickly devolves into an increasingly violent and bizarre competition at the hands of a pagan cult.",
    "Genre": {
      "Name": "Horror",
      "Definition": "Horror is a genre of storytelling intended to scare, shock, and thrill its audience. Horror can be interpreted in many different ways, but there is often a central villain, monster, or threat that is often a reflection of the fears being experienced by society at the time. This person or creature is called the “other,” a term that refers to someone that is feared because they are different or misunderstood. This is also why the horror genre has changed so much over the years. As culture and fears change, so does horror."
    },
    "Director": {
      "Name": "Ari Aster",
      "Biography": "Ari Aster was born on July 15, 1986 in New York City, New York, USA. He is a director and writer, known for Hereditary (2018), Midsommar (2019) and Disappointment Blvd. (2022).",
      "Date of birth": "July 15, 1986"
    },
    "ImageURL": "https://www.imdb.com/title/tt8772262/mediaviewer/rm3772802304/",
    "Featured": true
  },

  {
    "Title": "2001: A Space Odyssey",
    "Description": "The Monoliths push humanity to reach for the stars; after their discovery in Africa generations ago, the mysterious objects lead mankind on an awesome journey to Jupiter, with the help of H.A.L. 9000: the world's greatest supercomputer.",
    "Genre": {
      "Name": "Science fiction",
      "Definition": "Also known as Sci-Fi, these are fictional stories based on science. They can be about the future or other worlds, and often include spaceships, extra-terrestrial beings (aliens), and advanced technology we don't currently have."
    },
    "Director": {
      "Name": "Stanley Kubrick",
      "Biography": "Born in New York City on July 26, 1928, Stanley Kubrick worked as a photographer for Look magazine before exploring filmmaking in the 1950s. He went on to direct a number of acclaimed films, including Spartacus (1960), Lolita (1962), Dr. Strangelove (1964), A Clockwork Orange (1971), 2001: A Space Odyssey (1968), The Shining (1980), Full Metal Jacket (1987) and Eyes Wide Shut (1999). Kubrick died in England on March 7, 1999.",
      "Date of birth": "July 26, 1928"
    },
    "ImageURL": "https://www.imdb.com/title/tt0062622/mediaviewer/rm2176715520/",
    "Featured": true
  }
];

let users = [
  {
    "Username": "TheKingOfBurden",
    "Name": "Stan",
    "Email": "thekingofburden@gmail.com",
    "Birthdate": "1990-08-05",
    "Favourite movies": [],
    "id": 1
  },
  {
    "Username": "MotherOfDragons",
    "Name": "Elena",
    "Email": "elfesteem@gmail.com",
    "Birthdate": "1967-04-22",
    "Favourite movies": [],
    "id": 2
  }
];

app.get('/', (req, res) => {
  res.send('Wellcome to myFlix - your movie app of choice!');
});

// READ // Gets ALL movies
app.get('/movies', passport.authenticate('jwt', { session: false }), (req, res) => {
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
app.get('/users/:Username', passport.authenticate('jwt', { session: false }), (req, res) => {
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
