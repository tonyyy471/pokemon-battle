class PokemonFetcher {

    constructor() {
    }

    async fetchMaxFiveHundredPokemons(count) {
        if (this.pokemons)
            return this.pokemons;
        else
            this.pokemons = [];

        count = count > 500 ? 500 : count;

        let chunkOfTwenty = await this.fetch('https://pokeapi.co/api/v2/pokemon/');

        for (let i = 0; i < Math.ceil(count / 20); i++) {
            await this.addEvery(chunkOfTwenty, count);
            chunkOfTwenty = await this.fetch(chunkOfTwenty.next);
        }

        return this.pokemons;
    }

    async addEvery(currentTwenty, count) {
        for (let i = 0; i < currentTwenty.results.length; i++) {
            if (this.pokemons.length === count)
                return;
            const pokemonUrl = currentTwenty.results[i].url;
            const pokemon = await this.fetch(pokemonUrl);
            this.pokemons.push(pokemon);
        }
    }

    fetch(url) {
        return new Promise((resolve, reject) => {
            this.request(url, resolve, reject);
        })
    }

    request(url, resolve, reject) {
        const request = new XMLHttpRequest();
        request.open('get', url);
        request.onload = function () {
            if (this.status >= 200 && this.status < 300) {
                resolve(JSON.parse(this.responseText));
            } else {
                reject({status: this.status, statusText: this.responseText});
            }
        };
        request.onerror = function () {
            reject({status: this.status, statusText: this.responseText});
        };
        request.send();
    }
}