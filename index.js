const express = require('express');
const app = express();

let movies = [
  {
    title: 'Star Wars',
    directed_by: 'George Lucas'
  },
  {
    title: 'A Clockwork Orange',
    directed_by: 'Stanley Kubrick'
  },
  {
    title: 'The Matrix',
    directed_by: 'The Washowski Brothers'
  },
  {
    title: 'The Holy Mountain',
    directed_by: 'Alejandro Jodorowsky'
  },
  {
    title: 'Waking Life',
    directed_by: 'Richard Linklater'
  },
  {
    title: 'Zeitgeist: The Movie',
    directed_by: 'Peter Joseph'
  },
  {
    title: 'Salò, or the 120 Days of Sodom (Salò o le 120 giornate di Sodoma)',
    directed_by: 'Pier Paolo Pasolini'
  },
  {
    title: 'Lost Highway',
    directed_by: 'David Lynch'
  },
  {
    title: 'Seven Samurai (Shichinin no samurai)',
    directed_by: 'Akira Kurosawa'
  },
  {
    title: 'Dumbo (1941)',
    directed_by: 'Samuel Armstrong (sequence director), Norman Ferguson (sequence director), Wilfred Jackson (sequence director)'
  }
];

app.get('/', (req, res) => {
  res.send('Wellcome to myFlix - your movie app of choice!');
});

app.get('/documentation', (req, res) => {
  res.sendFile('public/documentation.html', {root: __dirname})
});

app.get('/movies', (req, res) => {
  res.json(movies);
});

app.listen(8080, () => {
  console.log('Your app is listening to port 8080.');
});