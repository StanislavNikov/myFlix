const mongoose = require('mongoose'),
      bcrypt = require('bcrypt');
/* const { stringify } = require('uuid'); can't remember adding this line of code */

let movieSchema = mongoose.Schema({
  Title: {type: String, required: true},
  Description: {type: String, required: true},
  Genre: {
    Name: String,
    Description: String
  },
  Director: {
    Name: String,
    Biography: String
  },
  Actors: [String],
  ImagePath: String,
  Featured: Boolean
});

let userSchema = mongoose.Schema({
  "Username": {type: String, required: true},
  "Password": {type: String, required: true},
  "Email": {type: String, required: true},
  "Birthdate": Date,
  "Favourite movies": [{type: mongoose.Schema.Types.ObjectId, ref: 'Movie'}]
});

userSchema.statics.hashPassword = (password) => {
  return bcrypt.hashSync(password, 10);
};
userSchema.methods.validatePassword = function(password) {
  return bcrypt.compareSync(password, this.Password);
};

let genreSchema = mongoose.Schema({
  Name: String,
  Definition: String
});

let directorSchema = mongoose.Schema({
  "Name": String,
  "Biography": String,
  "Date of birth": Date
});

let Movie = mongoose.model('Movie', movieSchema);
let User = mongoose.model('User', userSchema);
let Genre = mongoose.model('Genre', genreSchema);
let Director = mongoose.model('Director', directorSchema);

module.exports.Movie = Movie;
module.exports.User = User;
module.exports.Genre = Genre;
module.exports.Director = Director;