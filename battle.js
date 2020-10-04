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

        if (pokemonSpeed === rivalSpeed) {
            if (Math.floor(Math.random() * 2) === 0) {
                this.playerOnTurn = 'pokemon';
                this.playerNotOnTurn = 'rival';
            } else {
                this.playerOnTurn = 'rival';
                this.playerNotOnTurn = 'pokemon';
            }
        } else {
            if (pokemonSpeed > rivalSpeed) {
                this.playerOnTurn = 'pokemon';
                this.playerNotOnTurn = 'rival';
            } else {
                this.playerOnTurn = 'rival';
                this.playerNotOnTurn = 'pokemon';
            }
        }
    }

    async getWinner() {
        const winner = new Promise(resolve => {
            this.resolveWinner = resolve;
        });

        this.load();
        this.makeMove();
        this.playSound('battle.mp3', 'main');

        await winner;

        setTimeout(() => {
            this.stopSound('main');
        }, 100);

        return winner;
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

    makeMove() {
        if (this.winnerIsFound(this.pokemonHp, 'You Lose!') || this.winnerIsFound(this.rivalHp, 'You Win!'))
            return;

        let damage = this.calculateDamage(this.playerOnTurn, this.playerNotOnTurn);
        if (damage > 0) {
            setTimeout(async () => {
                this.hideNameAndHealth(this.playerOnTurn);
                const forwardMove = this.playerOnTurn === 'pokemon' ? this.movePokemon('pokemon', 27, 63, 1) :
                    this.movePokemon('rival', 66, 30, -1);
                await forwardMove;
                await this.blinkThreeTimes(this.playerNotOnTurn);
                await this.updateHealthAndHealthBar(this.playerNotOnTurn, damage);
                const backwardMove = this.playerOnTurn === 'pokemon' ? this.movePokemon('pokemon', 63, 63, -1) :
                    this.movePokemon('rival', 30, 30, 1);
                await backwardMove;
                this.showNameAndHealth(this.playerOnTurn);
                [this.playerOnTurn, this.playerNotOnTurn] = [this.playerNotOnTurn, this.playerOnTurn];
                this.makeMove();
            }, 1000)
        } else {
            [this.playerOnTurn, this.playerNotOnTurn] = [this.playerNotOnTurn, this.playerOnTurn];
            this.makeMove();
        }
    }

    winnerIsFound(pokemonHp, message) {
        if (pokemonHp <= 0) {
            setTimeout(() => {
                this.resolveWinner(message);
            }, 500);
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
        let resolveMove;
        const move = new Promise((resolve => {
            resolveMove = resolve;
        }));

        const playerOnTurnContainer = document.getElementById(playerOnTurn);

        const distance = Math.abs(startPosition - endPosition);

        this.addMoveEffect(playerOnTurn,distance, direction);
        setTimeout(resolveMove, 2000);

        return move;
    }

    hideNameAndHealth(playerOnTurn) {
        document.getElementById(playerOnTurn + '-name').style.visibility = 'hidden';
        document.getElementById(playerOnTurn + '-health').style.visibility = 'hidden';
    }

    showNameAndHealth(playerOnTurn) {
        document.getElementById(playerOnTurn + '-name').style.visibility = 'visible';
        document.getElementById(playerOnTurn + '-health').style.visibility = 'visible';
    }

    blinkThreeTimes(playerNotOnTurn) {
        let resolveBlink;
        const blinkThreeTimes = new Promise((resolve => {
            resolveBlink = resolve;
        }));

        const img = document.getElementById(playerNotOnTurn + '-img');

        const original = img.src;
        const shiny = playerNotOnTurn === 'pokemon' ? this[playerNotOnTurn].sprites.back_shiny : this[playerNotOnTurn].sprites.front_shiny;

        let counter = 0;
        const interval = setInterval(() => {
            if (img.src === original) {
                img.src = shiny;
                this.playSound('punch.wav', 'punch');
                setTimeout(() => {
                    this.stopSound('punch');
                }, 300);
            } else
                img.src = original;

            counter++;

            if (counter === 6) {
                clearInterval(interval);
                setTimeout(() => {
                    resolveBlink();
                }, 750)
            }
        }, 750);

        return blinkThreeTimes;
    }

    updateHealthAndHealthBar(playerNotOnTurn, damage) {
        let resolveHealthUpdate;
        const updateHealth = new Promise((resolve) => {
            resolveHealthUpdate = resolve;
        });

        const initialHealth = this[playerNotOnTurn].stats[0].base_stat;
        const oldHealth = this[playerNotOnTurn + 'Hp'];
        const newHealth = oldHealth - damage;

        const bar = document.getElementById(playerNotOnTurn + '-health-bar');

        this[playerNotOnTurn + 'Hp'] = newHealth;

        let oldHealthBar = (oldHealth / initialHealth) * 100;
        const newHealthBar = this[playerNotOnTurn + 'Hp'] < 0 ? 0 : (newHealth / oldHealth) * 100;

        let interval = setInterval(() => {
            oldHealthBar--;
            bar.style.width = oldHealthBar + '%';

            if (oldHealthBar <= 10) {
                bar.style.backgroundColor = 'red';
            } else if (oldHealthBar <= 50) {
                bar.style.backgroundColor = 'yellow';
            }

            if (oldHealthBar < newHealthBar) {
                setTimeout(resolveHealthUpdate, 250);
                clearInterval(interval);
            }
        }, 10);

        return updateHealth;
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

    addMoveEffect(playerOnTurn,distance, direction) {
        gsap.to('#' + playerOnTurn, {duration: 2.5, x: (distance * direction) + 'vw', ease: 'circ.out'});
    }
}