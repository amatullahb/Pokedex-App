const express = require('express');
const router = express.Router();
const axios = require('axios'); 
const pokemon25 = 'https://pokeapi.co/api/v2/pokemon?limit=25'; // 'https://pokeapi.co/api/v2/pokemon?offset=151&;amp;limit=25'

class Pokemon {
    constructor(name, url) {
        this.name = name;
        this.url = url;
        this.id;
    }
}

router.get('/', asyncHandler(async (req, res) => { 
    let pokedex = [];
    const rawPokedex = await getPokedexData(pokemon25);
    rawPokedex.forEach(pokemon => {
        pokedex.push(new Pokemon(pokemon.name, pokemon.url))
    })
    for await (const pokemon of pokedex) {
        let data  = await getPokemonData(pokemon.url); // why does { pokemon.id, pokemon.type } = await getPokemonData(pokemon); produce an error?
        pokemon.id = data.id;
        pokemon.type = data.type;
        pokemon.img = data.img;
    }
    res.render('index', {pokedex: pokedex});
}));
router.get('/card', asyncHandler((req, res) => {
    res.render('card', { pokemon: pokemon });
}));

router.post('/card', async (req, res) => {
    const name = req.body.pokemon_name;
    console.log(req.body);
    console.log(name);
    const url = `https://pokeapi.co/api/v2/pokemon/${name}`;
    const pokemonData = await getPokemonData(url);
    let pokemon = new Pokemon(pokemonData.name, pokemonData.url);
    pokemon.id = pokemonData.id;
    pokemon.type = pokemonData.type;
    pokemon.img = pokemonData.img;
    res.render('card', { pokemon: pokemon });
});

function asyncHandler(cb) {
    // abstracts away try...catch
    return async (req, res, next) => {
        try {
            await cb(req, res, next);
        } catch (err) {
            res.render('error', {error: err});
        }
    }
}
async function getPokedexData(url) {
    const res = await axios.get(url);
    return res.data.results
}
async function getPokemonData(url) { // `https://pokeapi.co/api/v2/pokemon/${pokemon.name}`
    const res = await axios.get(url);
    const id = res.data.id;
    const type = res.data.types[0].type.name;
    const img = res.data.sprites.front_default;
    const name = res.data.forms['0'].name;
    return {name, id, type, img, url};

}

module.exports = router;