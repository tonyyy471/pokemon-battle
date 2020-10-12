class PokemonLoader {

    constructor(pokemons) {
        this.pokemons = pokemons;
    }

    opponents = new Promise(resolve => {
        this.resolveOpponents = resolve;
    });

    async getOpponents() {
        this.initializeFields();
        this.load();
        return this.opponents;
    }

    initializeFields() {
        this.abilities = this.collectAbilities();
        this.abilityFilter = 'none';
        this.startIndex = 0;
        this.filteredPokemons = [];
    }

    load() {
        this.loadPokemonsContainer();
        this.loadPokemons(this.startIndex);
        this.loadAbilitiesFilter();
        this.loadPagination();
    }

    loadPokemons(startIndex) {
        this.loadFilteredPokemons(startIndex);

        const endIndex = startIndex + 20 <= this.filteredPokemons.length ? startIndex + 20 : this.filteredPokemons.length;

        for (let i = startIndex; i < endIndex; i++) {
            const pokemon = this.filteredPokemons[i];

            if (this.abilityFilter === 'none')
                this.loadSingle(pokemon, i);
            else if (this.getAbility(pokemon.abilities) === this.abilityFilter)
                this.loadSingle(pokemon, i);
        }

        this.addPokemonsEffects();
    }

    loadFilteredPokemons() {
        if (this.abilityFilter === 'none') {
            this.filteredPokemons = this.pokemons;
            return;
        }

        this.filteredPokemons = [];
        for (let i = 0; i < this.pokemons.length; i++) {
            const pokemon = this.pokemons[i];
            if (this.getAbility(pokemon.abilities) === this.abilityFilter) {
                this.filteredPokemons.push(pokemon);
            }
        }
    }

    loadSingle(pokemon, id) {
        const pokemonsContainer = document.getElementById('pokemons-container');
        const pokemonContainer = this.loadPokemonContainer(id);

        this.addImage(pokemonContainer, pokemon.sprites.front_default);
        this.addInfo(pokemonContainer, 'Name', pokemon.name);

        if (pokemon.abilities)
            this.addInfo(pokemonContainer, 'Ability', this.getAbility(pokemon.abilities));

        if (pokemon.moves) {
            const moves = pokemon.moves.length < 4 ? pokemon.moves.length : 4;
            for (let i = 0; i < moves; i++) {
                this.addInfo(pokemonContainer, `Move ${i}`, pokemon.moves[i].move.name);
            }
        }

        if (pokemon.stats) {
            for (let i = 0; i < pokemon.stats.length; i++) {
                this.addInfo(pokemonContainer, pokemon.stats[i].stat.name, pokemon.stats[i].base_stat);
            }
        }

        pokemonsContainer.appendChild(pokemonContainer);
    }

    loadPokemonsContainer() {
        const container = document.createElement('div');
        container.id = 'pokemons-container';
        container.className = 'pokemons-container';
        document.body.appendChild(container);
    }

    loadPokemonContainer(id) {
        const container = document.createElement('span');
        container.id = id;
        container.className = 'pokemon';
        container.addEventListener('click', async () => {
            const opponentId = this.getRandomId(id);
            await Waiter.wait(750);

            this.clearPokemons();
            this.resolveOpponents([this.filteredPokemons[id], this.pokemons[opponentId]]);
        });

        return container;
    }

    addImage(container, src) {
        const image = document.createElement('img');
        image.className = 'pokemon-image';
        image.src = src;
        container.appendChild(image);
    }

    addInfo(container, type, value) {
        const info = document.createElement('i');
        info.className = 'pokemon-info';
        info.innerText = `${type}: ${value}`;
        container.appendChild(info);
    }

    getAbility(abilities) {
        for (let current of abilities) {
            if (!current.is_hidden)
                return current.ability.name;
        }

        return 'none';
    }

    collectAbilities() {
        const abilities = new Set();

        for (let i = 0; i < this.pokemons.length; i++) {
            const pokemon = this.pokemons[i];
            const ability = this.getAbility(pokemon.abilities);
            abilities.add(ability);
        }
        abilities.add('none');

        return abilities;
    }

    loadAbilitiesFilter() {
        const filterContainer = this.loadFilterContainer();
        const filterButton = this.loadFilterButton();
        const filteringValues = this.loadFilteringValues();

        filterContainer.append(filterButton, filteringValues);
        document.body.appendChild(filterContainer);

        this.addStaggerEffectOnload('dropup');
    }

    loadFilterContainer() {
        const container = document.createElement('div');
        container.id = 'filter-container';
        container.className = 'dropup';
        return container;
    }

    loadFilterButton() {
        const button = document.createElement('button');
        button.className = 'dropbtn';
        button.innerText = 'Filter by Ability';
        return button;
    }

    loadFilteringValues() {
        const dropUpContent = document.createElement('div');
        dropUpContent.className = 'dropup-content';

        this.abilities.forEach((a) => {
            const ability = document.createElement('i');
            ability.innerText = a.toString();
            ability.addEventListener('click', () => {
                this.abilityFilter = a;
                this.startIndex = 0;
                this.clearPokemons();
                this.load();
            });
            dropUpContent.appendChild(ability);
        });
        return dropUpContent;
    }

    loadPagination() {
        const paginationContainer = this.loadPaginationContainer();

        const prev = this.loadPaginationButton('prev');
        this.checkForPaginationButtonDisabling(prev, this.startIndex === 0);
        this.handlePaginationButtonOnClick(prev);

        const next = this.loadPaginationButton('next');
        this.checkForPaginationButtonDisabling(next, this.startIndex + 20 >= this.filteredPokemons.length);
        this.handlePaginationButtonOnClick(next);

        paginationContainer.append(prev, next);
        document.body.appendChild(paginationContainer);

        this.addStaggerEffectOnload('pagination-button');
        this.addStaggerEffectOnload('pagination-button-disabled');
    }

    loadPaginationContainer() {
        const container = document.createElement('div');
        container.id = 'pagination-container';
        return container;
    }

    loadPaginationButton(value) {
        let button = document.createElement('button');
        button.id = value;
        button.className = 'pagination-button';
        button.innerText = value;
        return button;
    }

    disablePaginationButton(button) {
        button.className = 'pagination-button-disabled';
        button.disabled = true;
    }

    enablePaginationButton(button) {
        button.className = 'pagination-button';
        button.disabled = false;
    }

    handlePaginationButtonOnClick(button) {
        button.addEventListener('click', () => {
            this.clearPokemonsContainerContent(document.getElementById('pokemons-container'));

            if (button.id === 'next')
                this.updateStartIndexAndCheckForButtonsEnablingOrDisabling(this.startIndex + 20, button, 'prev',
                    this.startIndex + 20 >= this.filteredPokemons.length, this.startIndex === 0);
            else
                this.updateStartIndexAndCheckForButtonsEnablingOrDisabling(this.startIndex - 20, button, 'next',
                    this.startIndex === 0, this.startIndex + 20 >= this.filteredPokemons.length);
            this.clearPokemons();
            this.load();
        })
    }

    updateStartIndexAndCheckForButtonsEnablingOrDisabling(startIndexNewValue, button, otherButtonId, edgeIsReachedForButton, edgeIsReachedForOtherButton) {
        this.startIndex = startIndexNewValue;
        this.checkForPaginationButtonDisabling(button, edgeIsReachedForButton);
        this.checkForPaginationButtonEnabling(document.getElementById(otherButtonId), edgeIsReachedForOtherButton);
    }

    clearPokemonsContainerContent(container) {
        while (container.firstChild) {
            container.removeChild(container.lastChild);
        }
    }

    clearPokemons() {
        document.body.removeChild(document.getElementById('pokemons-container'));
        document.body.removeChild(document.getElementById('pagination-container'));
        document.body.removeChild(document.getElementById('filter-container'));
    }

    checkForPaginationButtonEnabling(button, edgeIsReached) {
        if (!edgeIsReached && button.disabled === true)
            this.enablePaginationButton(button);
    }

    checkForPaginationButtonDisabling(button, edgeIsReached) {
        if (edgeIsReached && button.disabled === false)
            this.disablePaginationButton(button);
    }

    getRandomId(chosenId) {
        do {
            var opponentId = Math.floor(Math.random() * this.pokemons.length);
        } while (opponentId === chosenId);
        return opponentId;
    }

    addPokemonsEffects() {
        this.addStaggerEffectOnload('pokemon');
        this.addStaggerEffectOnUnload('pokemon', 'pokemons-container');
        this.addStaggerEffectOnUnload('pokemon', 'dropup');
        this.addStaggerEffectOnUnload('pokemon', 'pagination-button');
        this.addStaggerEffectOnUnload('pokemon', 'pagination-button-disabled');
    }

    addStaggerEffectOnload(className) {
        gsap.from('.' + className, {
            duration: 1,
            scale: 0.5,
            opacity: 0,
            delay: 0.0,
            stagger: 0.1,
            ease: "elastic",
            force3D: true
        });
    }

    addStaggerEffectOnUnload(clickedObjectClassName, objectToUnloadClassNAme) {
        document.querySelectorAll('.' + clickedObjectClassName).forEach(function (box) {
            box.addEventListener("click", function () {
                gsap.to('.' + objectToUnloadClassNAme, {
                    duration: 0.2,
                    opacity: 0,
                    y: -100,
                    stagger: 0.1,
                    ease: "back.in"
                });
            });
        });

    }
}