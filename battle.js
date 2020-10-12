class Battle {

    constructor(pokemon, rival) {
        this.pokemon = pokemon;
        this.pokemonHp = pokemon.stats[0].base_stat;

        this.rival = rival;
        this.rivalHp = rival.stats[0].base_stat;

        this.setPlayerOnTurn();
    }

    setPlayerOnTurn() {
        const pokemonSpeed = this.pokemon.stats[5].base_stat;
        const rivalSpeed = this.rival.stats[5].base_stat;

        pokemonSpeed === rivalSpeed ? this.setTurns(Math.floor(Math.random() * 2) === 0 ? 'pokemon' : 'rival') :
            this.setTurns(pokemonSpeed > rivalSpeed ? 'pokemon' : 'rival');
    }

    setTurns(playerOnTurn) {
        this.playerOnTurn = playerOnTurn;
        this.playerNotOnTurn = playerOnTurn === 'pokemon' ? 'rival' : 'pokemon';
    }

    async getWinner() {
        this.load();
        this.playSound('battle.mp3', 'main');
        await this.makeMove();
        await Waiter.wait(250);
        this.stopSound('main');
        return this.winnerMessage;
    }

    load() {
        this.loadOpponentsContainer();
        this.loadOpponents();
    }

    loadOpponentsContainer() {
        const container = document.createElement('div');
        container.id = 'opponents-container';
        document.body.appendChild(container);
    }

    loadOpponents() {
        this.loadOpponent(this.pokemon, 'pokemon');
        this.loadOpponent(this.rival, 'rival')
    }

    loadOpponent(opponent, id) {
        const opponentsContainer = document.getElementById('opponents-container');
        const opponentContainer = this.loadOpponentContainer(id);

        this.addName(opponentContainer, opponent.name, id);
        const health = this.addHealth(opponentContainer, this[id + 'Hp'], id);
        this.addHealthBar(id, health);
        this.addImage(opponentContainer, id === 'pokemon' ? opponent.sprites.back_default : opponent.sprites.front_default, id);

        opponentsContainer.appendChild(opponentContainer);

        this.addBounceEffect(id);
    }

    loadOpponentContainer(id) {
        const container = document.createElement('span');
        container.id = id;
        return container;
    }

    addName(container, value, id) {
        const name = document.createElement('i');
        name.id = id + '-name';
        name.className = 'opponent-name';
        name.innerText = value;
        container.appendChild(name);
    }

    addHealth(container, value, id) {
        const health = document.createElement('span');
        health.id = id + '-health';
        health.className = 'opponent-health';
        container.appendChild(health);
        return health;
    }

    addHealthBar(id, health) {
        const healthBar = document.createElement('span');
        healthBar.id = id + '-health-bar';
        healthBar.className = 'opponent-health-bar';
        healthBar.innerText = '.';
        health.appendChild(healthBar);
    }

    addImage(container, src, id) {
        const image = document.createElement('img');
        image.id = id + '-img';
        image.src = src;
        container.appendChild(image);
    }

    async makeMove() {
        if (await this.winnerIsFound(this.pokemonHp, 'You Lose!') || await this.winnerIsFound(this.rivalHp, 'You Win!'))
            return;

        let damage = this.calculateDamage(this.playerOnTurn, this.playerNotOnTurn);
        if (damage > 0) {
            await Waiter.wait(1000);

            this.hideNameAndHealth(this.playerOnTurn);

            if (this.playerOnTurn === 'pokemon') this.movePokemon('pokemon', 27, 63, 1);
            else this.movePokemon('rival', 66, 30, -1);
            await Waiter.wait(2000);

            await this.blinkThreeTimes(this.playerNotOnTurn);
            await Waiter.wait(500);

            const timeUpdatingHealthBar = await this.updateHealthAndHealthBar(this.playerNotOnTurn, damage);
            await Waiter.wait(timeUpdatingHealthBar);

            if (this.playerOnTurn === 'pokemon') this.movePokemon('pokemon', 63, 63, -1);
            else this.movePokemon('rival', 30, 30, 1);
            await Waiter.wait(2000);

            this.showNameAndHealth(this.playerOnTurn);
            this.changeTurns();
            await this.makeMove();
        } else {
            this.changeTurns();
            await this.makeMove();
        }
    }

    changeTurns() {
        [this.playerOnTurn, this.playerNotOnTurn] = [this.playerNotOnTurn, this.playerOnTurn];
    }

    async winnerIsFound(pokemonHp, message) {
        if (pokemonHp <= 0) {
            this.winnerMessage = message;
            await Waiter.wait(500);
            return true;
        }
        return false;
    }

    calculateDamage(playerOnTurnId, playerNotOnTurnId) {
        const attack = this[playerOnTurnId].stats[1].base_stat;
        const defence = this[playerNotOnTurnId].stats[2].base_stat;
        const randomNumber = (Math.floor(Math.random() * 200));
        return (attack / defence) * randomNumber;
    }

    movePokemon(playerOnTurn, startPosition, endPosition, direction) {
        const playerOnTurnContainer = document.getElementById(playerOnTurn);
        const distance = Math.abs(startPosition - endPosition);
        this.addMoveEffect(playerOnTurn, distance, direction);
    }

    hideNameAndHealth(playerOnTurn) {
        document.getElementById(playerOnTurn + '-name').style.visibility = 'hidden';
        document.getElementById(playerOnTurn + '-health').style.visibility = 'hidden';
    }

    showNameAndHealth(playerOnTurn) {
        document.getElementById(playerOnTurn + '-name').style.visibility = 'visible';
        document.getElementById(playerOnTurn + '-health').style.visibility = 'visible';
    }

    async blinkThreeTimes(playerNotOnTurn) {
        const img = document.getElementById(playerNotOnTurn + '-img');

        const original = img.src;
        const shiny = playerNotOnTurn === 'pokemon' ? this[playerNotOnTurn].sprites.back_shiny : this[playerNotOnTurn].sprites.front_shiny;

        for (let i = 0; i < 6; i++) {
            await Waiter.wait(500);
            this.changeSprite(img, original, shiny);
            if (i % 2 === 0)
                await this.addPunchSound();
        }
    }

    changeSprite(img, original, shiny) {
        if (img.src === original) {
            img.src = shiny;
        } else
            img.src = original;
    }

    async addPunchSound() {
        this.playSound('punch.wav', 'punch');
        await Waiter.wait(300);
        this.stopSound('punch');
    }

    async updateHealthAndHealthBar(playerNotOnTurn, damage) {
        const initialHealth = this[playerNotOnTurn].stats[0].base_stat;
        const oldHealth = this[playerNotOnTurn + 'Hp'];
        const newHealth = oldHealth - damage;

        const bar = document.getElementById(playerNotOnTurn + '-health-bar');

        this[playerNotOnTurn + 'Hp'] = newHealth;

        let oldHealthBar = (oldHealth / initialHealth) * 100;
        const newHealthBar = this[playerNotOnTurn + 'Hp'] < 0 ? 0 : (newHealth / oldHealth) * 100;

        this.declineHealthBar(bar, oldHealthBar, newHealthBar);

        return ((oldHealthBar - newHealthBar) * 10) + 750;
    }

    declineHealthBar(bar, oldHealthBar, newHealthBar) {
        async function declineHealthBar() {
            await Waiter.wait(10);
            bar.style.width = --oldHealthBar + '%';

            if (oldHealthBar <= 10) bar.style.backgroundColor = 'red';
            else if (oldHealthBar <= 50) bar.style.backgroundColor = 'yellow';

            if (oldHealthBar > newHealthBar)
                window.requestAnimationFrame(declineHealthBar);
        }

        window.requestAnimationFrame(declineHealthBar);
    }

    playSound(src, id) {
        const audio = document.createElement('audio');
        audio.id = id;
        audio.src = src;
        audio.loop = true;
        document.body.appendChild(audio);
        audio.play();
    }

    stopSound(id) {
        const audio = document.getElementById(id);
        audio.pause();
        document.body.removeChild(audio);
    }

    addBounceEffect(id) {
        gsap.to('#' + id, {duration: 1.5, y: 26 + 'vh', ease: "bounce"});
    }

    addMoveEffect(playerOnTurn, distance, direction) {
        gsap.to('#' + playerOnTurn, {duration: 2.5, x: (distance * direction) + 'vw', ease: 'circ.out'});
    }
}