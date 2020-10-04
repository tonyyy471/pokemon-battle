class Game {

    constructor() {
    }

    async start() {
        this.loadLoadingMessage();

        const pokemonFetcher = new PokemonFetcher();
        const pokemons = await pokemonFetcher.fetchMaxFiveHundredPokemons(100);

        this.addStaggerEffectOnUnload('loading-container');
        await this.clearScreen('loading-container', 500);

        const pokemonLoader = new PokemonLoader(pokemons);
        const opponents = await pokemonLoader.getOpponents();

        const battle = new Battle(...opponents);
        const outcome = await battle.getWinner();

        this.addStaggerEffectOnUnload('opponents-container');
        await this.clearScreen('opponents-container', 500);
        this.loadFinalMessageAndReplayButton(outcome);
    }

    clearScreen(elementId, timeOut) {
        setTimeout(() => {
            document.body.removeChild(document.getElementById(elementId));
        }, timeOut);

        return new Promise((resolve) => {
            setTimeout(resolve, timeOut);
        })
    }

    loadLoadingMessage() {
        const container = this.loadContainer('loading-container');
        const message = this.loadMessage('loading-message', 'loading...');
        container.appendChild(message);
        document.body.appendChild(container);

        this.addStaggerEffectOnload('loading-message');
    }

    loadFinalMessageAndReplayButton(msg) {
        const container = this.loadContainer('final-container');
        const message = this.loadMessage('win-message', msg);
        const button = this.loadButton();

        container.append(message, button);
        document.body.appendChild(container);

        this.addStaggerEffectOnload('win-message');
        this.addStaggerEffectOnload('replay-button');
    }

    loadContainer(id) {
        const container = document.createElement('div');
        container.id = id;
        return container;
    }

    loadMessage(id, msg) {
        const message = document.createElement('i');
        message.id = id;
        message.innerText = msg;
        return message;
    }

    loadButton() {
        const button = document.createElement('button');
        button.id = 'replay-button';
        button.innerText = 'Play Again';
        button.addEventListener('click', () => {
            this.addStaggerEffectOnUnload('win-message');
            this.addStaggerEffectOnUnload('replay-button');
            setTimeout(() => {
                this.clearScreen('final-container');
                this.start();
            }, 500);
        });
        return button;
    }

    addStaggerEffectOnload(id) {
        gsap.from('#' + id, {
            duration: 1,
            scale: 0.5,
            opacity: 0,
            delay: 0.0,
            stagger: 0.1,
            ease: "elastic",
            force3D: true
        });
    }

    addStaggerEffectOnUnload(id) {
        gsap.to('#' + id, {
            duration: 0.5,
            opacity: 0,
            y: -100,
            stagger: 0.1,
            ease: "back.in"
        });
    }
}