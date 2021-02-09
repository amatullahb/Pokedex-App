const express = require('express');
const router = express.Router();
const axios = require('axios'); 
const pokemon25 = 'https://pokeapi.co/api/v2/pokemon?offset=151&;amp;limit=25';
const pokemon100 = 'https://pokeapi.co/api/v2/pokemon?limit=100';
const pokemon228 = 'https://pokeapi.co/api/v2/pokemon?limit=228';

class Pokemon {
    constructor(name, url) {
        this.name = name;
        this.url = url;
        this.id;
    }
}

let pokedex = [];

router.get('/', asyncHandler(async (req, res) => { 
    const rawPokedex = await getPokedexData(pokemon228);
    rawPokedex.forEach(pokemon => {
        pokedex.push(new Pokemon(pokemon.name, pokemon.url))
    })
    for await (const pokemon of pokedex) {
        let data  = await getPokemonData(pokemon.url); 
        pokemon.name = data.name;
        pokemon.id = data.id;
        pokemon.type = data.type;
        pokemon.img = data.img;
        pokemon.abilities = [...data.abilities];
    }
    res.render('index', {pokedex: pokedex});
}));
router.get('/pokedex', (req, res) => {
    res.render('index', {pokedex: pokedex});
});

router.get('/card', (req, res) => {
    res.render('card', { pokemon: pokemon });
});
router.post('/card', async (req, res) => {
    const name = req.body.pokemon_name;
    const url = `https://pokeapi.co/api/v2/pokemon/${name}`;
    const pokemonData = await getPokemonData(url);
    let pokemon = new Pokemon(pokemonData.name, pokemonData.url);
    pokemon.id = pokemonData.id;
    pokemon.type = pokemonData.type;
    pokemon.img = pokemonData.img;
    pokemon.abilities = [...pokemonData.abilities];
    res.render('card', { pokemon: pokemon });
});

router.get('/filter', (req, res) => {
    res.render('index', {pokedex: pokedex});
});
router.post('/filter', (req, res) => {
    const type = req.body.filter;
    let newPokedex = [...filterBy(type)];
    res.render('index', {pokedex: [...filterBy(type)]});
});

router.get('/sort', (req, res) => {
    res.render('index', {pokedex: pokedex});
});
router.post('/sort', (req, res) => {
    const sorter = req.body.sort;
    let newPokedex = [...sortBy(sorter)];
    res.render('index', {pokedex: [...sortBy(sorter)]});
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
async function constructPokedex() {
    //use before router.get to avoid longer processing times when returning to / from /card
    asyncHandler(async() => {
        const rawPokedex = await getPokedexData(pokemon228);
        rawPokedex.forEach(pokemon => {
            pokedex.push(new Pokemon(pokemon.name, pokemon.url))
        })
        for await (const pokemon of pokedex) {
            let data  = await getPokemonData(pokemon.url); 
            pokemon.name = data.name;
            pokemon.id = data.id;
            pokemon.type = data.type;
            pokemon.img = data.img;
            pokemon.abilities = [...data.abilities];
        }
    });
    // return pokedex;
}
async function getPokedexData(url) {
    const res = await axios.get(url);
    return res.data.results
}
async function getPokemonData(url) { 
    const res = await axios.get(url);
    const id = res.data.id;
    const type = res.data.types[0].type.name;
    const img = res.data.sprites.front_default;
    const name = res.data.forms['0'].name[0].toUpperCase() + res.data.forms['0'].name.substring(1, res.data.forms['0'].name.length); //capitalizes name
    let abilities = [];
    res.data.abilities.forEach((ability) => {
        abilities.push(ability.ability.name);
    })
    return {name, id, type, img, url, abilities};
}
function filterBy(type){
    let newPokedex = [];
    pokedex.forEach((pokemon) => {
        if (pokemon.type == type) {
            newPokedex.push(pokemon);
        }
    })
    return newPokedex;
}
function sortBy(sorter) {
    let mapped = [];
    let tempPokedex = [...pokedex]
    if (sorter == 'name') {
        mapped = tempPokedex.map((pokemon, i) => {
            return {index: i, value: pokemon.name}
        })
    } else if (sorter == 'id') {
        mapped = tempPokedex.map((pokemon, i) => {
            return {index: i, value: pokemon.id}
        })
    } else if (sorter == 'type') {
        mapped = tempPokedex.map((pokemon, i) => {
            return {index: i, value: pokemon.type}
        })
    } else if (sorter == 'ability') {
        mapped = tempPokedex.map((pokemon, i) => {
            return {index: i, value: pokemon.abilities}
        })
    }
    mapped.sort((a,b) => {
        if (a.value > b.value) return 1;
        else if (a.value < b.value) return -1;
        else return 0;
    })
    const result = mapped.map(pokemon => {
        return tempPokedex[pokemon.index]
    })
    return result
}

module.exports = router;