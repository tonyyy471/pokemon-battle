class Game {

    constructor() {
    }

    async start() {
        this.loadLoadingMessage();

        const pokemons = await new PokemonFetcher().fetchMaxFiveHundredPokemons(100);
        await this.clearScreen(500, 'loading-container', 'loading-container');

        const opponents = await new PokemonLoader(pokemons).getOpponents();
        const outcome = await new Battle(...opponents).getWinner();
        await this.clearScreen(500, 'opponents-container', 'opponents-container');

        this.loadFinalMessageAndReplayButton(outcome);
    }

    async clearScreen(delay, elementToRemove, ...elementsToAddEffect) {
        elementsToAddEffect.forEach((id) => {
            this.addStaggerEffectOnUnload(id);
        });
        await Waiter.wait(delay);
        document.body.removeChild(document.getElementById(elementToRemove));
    }

    loadLoadingMessage() {
        const loadingMessageContainer = this.loadCanvas('loading-container', 500, 200);
        this.addMessage(loadingMessageContainer, 'loading...', 250, 100, '3vw');
        document.body.appendChild(loadingMessageContainer);
        this.addStaggerEffectOnload('loading-container');
    }

    loadCanvas(id, width, height) {
        const canvas = document.createElement('canvas');
        canvas.id = id;
        canvas.width = width;
        canvas.height = height;
        return canvas;
    }

    addMessage(canvas, message, x, y, fontSize) {
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = 'rgba(232, 236, 241, 0.7)';
        ctx.font = `italic ${fontSize} Arial`;
        ctx.textAlign = 'center';
        ctx.fillText(message, x, y);
    }

    loadFinalMessageAndReplayButton(msg) {
        const container = this.loadContainer('final-container');

        const winMessageContainer = this.loadCanvas('win-message', 800, 300);
        this.addMessage(winMessageContainer, msg, 400, 150, '7vw');
        const button = this.loadButton();

        container.append(winMessageContainer, button);
        document.body.appendChild(container);

        this.addStaggerEffectOnload('win-message');
        this.addStaggerEffectOnload('replay-button');
    }

    loadContainer(id) {
        const container = document.createElement('div');
        container.id = id;
        return container;
    }

    loadButton() {
        const button = document.createElement('button');
        button.id = 'replay-button';
        button.innerText = 'Play Again';
        button.addEventListener('click', async () => {
            await this.clearScreen(500, 'final-container', 'win-message', 'replay-button');
            await this.start();
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