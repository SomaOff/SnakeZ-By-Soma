// Tous droits réservés - SomaOff - 2020

class SnakeGame {
  constructor() {
    this.$app = document.querySelector('#app');
    this.$canvas = this.$app.querySelector('canvas');
    this.ctx = this.$canvas.getContext('2d');
    this.$startScreen = this.$app.querySelector('.start-screen');
    this.$score = this.$app.querySelector('.score');

    this.settings = {
      canvas: {
        width: window.innerWidth,
        height: window.innerHeight,
        background: '#A2C359',
        border: '#000'
      },
      snake: {
        size: 30,
        background: '#73854A',
        border: '#000'
      }
    };

    this.game = {

      speed: 100,
      keyCodes: {
        38: 'up',
        40: 'down',
        39: 'right',
        37: 'left'
      }  
    };

    this.soundEffects = {
      score: new Audio('./sounds/score.mp3'),
      gameOver: new Audio('./sounds/game-over.mp3')
    };

    this.setUpGame();
    this.init();
  }

  init() {
    // Choose difficulty
    this.$startScreen.querySelector('.options').addEventListener('click', event => {
      this.chooseDifficulty(event.target.dataset.difficulty);
    });

    // Play
    this.$startScreen.querySelector('.play-btn').addEventListener('click', () => {
      this.startGame();
    });
  }

  chooseDifficulty(difficulty) {
    if(difficulty) {
      this.game.speed = difficulty;
      this.$startScreen.querySelectorAll('.options button').forEach(btn => btn.classList.remove('active'));
      event.target.classList.add('active');
    }
  }

  setUpGame() {

    const x = 300;
    const y = 300;

    this.snake = [
      { x: x, y: y },
      { x: x - this.settings.snake.size, y: y },
      { x: x - (this.settings.snake.size * 2), y: y },
      { x: x - (this.settings.snake.size * 3), y: y },
      { x: x - (this.settings.snake.size * 4), y: y }
    ];

    this.food = {
      active: false,
      background: '#EC5E0B',
      border: '#73AA24',
      coordinates: {
        x: 0,
        y: 0  
      }
    };

    this.game.score = 0;
    this.game.direction = 'right';
    this.game.nextDirection = 'right';
  }

  startGame() {

    this.soundEffects.gameOver.pause();
    this.soundEffects.gameOver.currentTime = 0;


    this.$app.classList.add('game-in-progress');
    this.$app.classList.remove('game-over');
    this.$score.innerText = 0;

    this.generateSnake();

    this.startGameInterval = setInterval(() => {
      if(!this.detectCollision()) {
        this.generateSnake();
      } else {
        this.endGame();
      }
    }, this.game.speed);

    // Change direction
    document.addEventListener('keydown', event => {
      this.changeDirection(event.keyCode);
    });
  }

  changeDirection(keyCode) {
    const validKeyPress = Object.keys(this.game.keyCodes).includes(keyCode.toString());

    if(validKeyPress && this.validateDirectionChange(this.game.keyCodes[keyCode], this.game.direction)) {
      this.game.nextDirection = this.game.keyCodes[keyCode];
    }
  }

  validateDirectionChange(keyPress, currentDirection) {
    return (keyPress === 'left' && currentDirection !== 'right') || 
      (keyPress === 'right' && currentDirection !== 'left') ||
      (keyPress === 'up' && currentDirection !== 'down') ||
      (keyPress === 'down' && currentDirection !== 'up');
  }

  resetCanvas() {
    // Full screen size
    this.$canvas.width = this.settings.canvas.width;
    this.$canvas.height = this.settings.canvas.height;

    // Background
    this.ctx.fillStyle = this.settings.canvas.background;
    this.ctx.fillRect(0, 0, this.$canvas.width, this.$canvas.height);
  }

  generateSnake() {
    let coordinate;

    switch(this.game.direction) {
      case 'right':
        coordinate = {
          x: this.snake[0].x + this.settings.snake.size,
          y: this.snake[0].y
        };
      break;
      case 'up':
        coordinate = {
          x: this.snake[0].x,
          y: this.snake[0].y - this.settings.snake.size
        };
      break;
      case 'left':
        coordinate = {
          x: this.snake[0].x - this.settings.snake.size,
          y: this.snake[0].y
        };
      break;
      case 'down':
        coordinate = {
          x: this.snake[0].x,
          y: this.snake[0].y + this.settings.snake.size
        };
    }

    this.snake.unshift(coordinate);
    this.resetCanvas();

    const ateFood = this.snake[0].x === this.food.coordinates.x && this.snake[0].y === this.food.coordinates.y;

    if(ateFood) {
      this.food.active = false;
      this.game.score += 10;
      this.$score.innerText = this.game.score;
      this.soundEffects.score.play();
    } else {
      this.snake.pop();
    }

    this.generateFood();
    this.drawSnake();
  }

  drawSnake() {
    const size = this.settings.snake.size;

    this.ctx.fillStyle = this.settings.snake.background;
    this.ctx.strokestyle = this.settings.snake.border;

    this.snake.forEach(coordinate => {
      this.ctx.fillRect(coordinate.x, coordinate.y, size, size);
      this.ctx.strokeRect(coordinate.x, coordinate.y, size, size);
    });

    this.game.direction = this.game.nextDirection;
  }

  generateFood() {

    if(this.food.active) {
      this.drawFood(this.food.coordinates.x, this.food.coordinates.y);
      return;
    }

    const gridSize = this.settings.snake.size;
    const xMax = this.settings.canvas.width - gridSize;
    const yMax = this.settings.canvas.height - gridSize;

    const x = Math.round((Math.random() * xMax) / gridSize) * gridSize;
    const y = Math.round((Math.random() * yMax) / gridSize) * gridSize;

    this.snake.forEach(coordinate => {
      const foodSnakeConflict = coordinate.x == x && coordinate.y == y;

      if(foodSnakeConflict) {
        this.generateFood();
      } else {
        this.drawFood(x, y);
      }
    });
  }

  drawFood(x, y) {
    const size = this.settings.snake.size;

    this.ctx.fillStyle = this.food.background;
    this.ctx.strokestyle = this.food.border;

    this.ctx.fillRect(x, y, size, size);
    this.ctx.strokeRect(x, y, size, size);

    this.food.active = true;
    this.food.coordinates.x = x;
    this.food.coordinates.y = y;
  }

  detectCollision() {
    for(let i = 4; i < this.snake.length; i++) {
      const selfCollison = this.snake[i].x === this.snake[0].x && this.snake[i].y === this.snake[0].y;

      if(selfCollison) {
        return true;
      }
    }

    const leftCollison = this.snake[0].x < 0;
    const topCollison = this.snake[0].y < 0;
    const rightCollison = this.snake[0].x > this.$canvas.width - this.settings.snake.size;
    const bottomCollison = this.snake[0].y > this.$canvas.height - this.settings.snake.size;

    return leftCollison || topCollison || rightCollison || bottomCollison;
  }

  endGame() {
    this.soundEffects.gameOver.play();

    clearInterval(this.startGameInterval);

    this.$app.classList.remove('game-in-progress');
    this.$app.classList.add('game-over');
    this.$startScreen.querySelector('.options h3').innerText = 'Game Over';
    this.$startScreen.querySelector('.options .end-score').innerText = `Score: ${this.game.score}`;

    this.setUpGame();
  }
}

const snakeGame = new SnakeGame();
