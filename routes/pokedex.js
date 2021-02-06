const express = require('express');
const router = express.Router();
const axios = require('axios'); //or fs
const pokemon25 = 'https://pokeapi.co/api/v2/pokemon?offset=151&;amp;limit=25';
const pokemon5 = 'https://pokeapi.co/api/v2/pokemon?offset=151&;amp;limit=5'; //tester to make it easier to see
// const fs = require('fs'); //or axios

class Pokemon {
    constructor(name, url) {
        this.name = name;
        this.url = url;
        this.id;
    }
}

router.get('/', asyncHandler(async (req, res) => { 
    let pokedex = [];
    const rawPokedex = await getPokedexData(pokemon5);
    rawPokedex.forEach(pokemon => {
        pokedex.push(new Pokemon(pokemon.name, pokemon.url))
    })
    for await (const pokemon of pokedex) {
        let data  = await getPokemonData(pokemon); // why does { pokemon.id, pokemon.type } = await getPokemonData(pokemon); produce an error?
        pokemon.id = data.id;
        pokemon.type = data.type;
    }
    res.render('index');
}));

function asyncHandler(cb) {
    // abstracts away try/catch
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
async function getPokemonData(pokemon) {
    const res = await axios.get(pokemon.url);
    const id = res.data.id;
    const type = res.data.types[0].type.name
    return {id, type};
}

module.exports = router;

// const pokedex = require('https://pokeapi.co/api/v2/pokemon?offset=151&;amp;limit=25').results;
// results is an array of objects containing name and url
    // url leads to .id and .types.type.name which gives the category (eg electric)
// where to get image from?