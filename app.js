const express = require('express');
const app = express();
const bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({ extended: false}));

app.set('view engine', 'pug');

const pokedexRoutes = require('./routes/pokedex');

app.use(pokedexRoutes);
app.use('/static', express.static('public'));

app.listen(3000, () => {
    console.log('The app is running on localhost:3000');
});