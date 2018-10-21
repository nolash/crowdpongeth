import {
  Ball, ValueDisplay, Player, Paddle,
} from './Components';
import KeyListener from './KeyListener';

class Game {
  constructor(gameManager) {
    const canvas = document.getElementById('game');
    this.width = canvas.width;
    this.height = canvas.height;
    this.maxScore = gameManager.maxScore;
    this.context = canvas.getContext('2d');
    this.context.fillStyle = 'white';
    this.keys = new KeyListener(gameManager);

    // display number
    this.display1 = new ValueDisplay(this.width / 4, 25);
    this.display2 = new ValueDisplay(this.width * 3 / 4, 25);

    // paddleSerial increments by 10 every time (both) the paddles' position is updated
    // ballSerial increments by 1 every time the ball's position is updated
    this.paddleSerial = 0;
    this.ballSerial = 0;
    this.won = 0;

    const paddle1 = this.getInitialPaddle1();
    this.p1 = new Player(1, 'SomeName1', paddle1);
    const paddle2 = this.getInitialPaddle2();
    this.p2 = new Player(2, 'SomeName2', paddle2);

    // Display 2
    // Ball
    const ballX = this.width / 2;
    const ballY = this.height / 2;
    this.ball = new Ball(ballX, ballY);
    // this.ball.vy = Math.floor(Math.random() * 12 - 6)
    this.ball.vx = 5;
    this.ball.vy = 0;
  }

  // / PUBLIC
  calculateBounceDirection(collisionPoint) {
    const paddleMiddle = this.p1.paddle.height / 2;
    const direction = collisionPoint - paddleMiddle;
    // normalize
    return Math.round(((direction - 0) / paddleMiddle) * 5);
  }

  draw() {
    this.drawTime();
    this.drawPlayField();
    this.drawMiddleLine();

    this.ball.draw(this.context);

    this.p1.paddle.draw(this.context);
    this.p2.paddle.draw(this.context);

    this.display1.draw(this.context);
    this.display2.draw(this.context);
  }

  drawMiddleLine() {
    this.context.fillRect(this.width / 2, 0, 2, this.height);
  }

  drawPlayField() {
    this.context.clearRect(0, 0, this.width, this.height);
  }

  drawTime() {
    document.getElementById('timeBox').innerHTML = `Time = ${Math.round(new Date().getTime() / 1000)}`;
  }

  getInitialPaddle1() {
    const paddle = new Paddle(5, 0);
    paddle.y = this.height / 2 - paddle.height / 2;
    return paddle;
  }

  getInitialPaddle2() {
    const paddle = new Paddle(this.width - 5 - 2, 0);
    paddle.y = this.height / 2 - paddle.height / 2;
    return paddle;
  }

  score(player) {
    player.score++;
    const isPlayer1Winner = player.playerNumber === this.p1.playerNumber;

    // set ball position
    this.ball.x = this.width / 2;
    this.ball.y = player.paddle.y + player.paddle.height / 2;

    // set ball velocity
    this.ball.vx = 5;
    this.ball.vy = 0;

    if (isPlayer1Winner) {
      this.ball.vx *= -1;
    }
  }

  setNextMove(playerNumber, direction, velocity) {
    const player = playerNumber === 1 ? this.p1 : this.p2;
    //console.log('setnextmove', playerNumber, direction, velocity);
    if (direction === 'DOWN') { // DOWN
      player.paddle.y = Math.min(this.height - player.paddle.height, player.paddle.y + velocity * 6);
    } else if (direction === 'UP') { // UP
      player.paddle.y = Math.max(0, player.paddle.y - velocity * 6);
    }
  }

  update() {
    // upate ball
    this.ball.setNextPosition();

    // update Score
    this.display1.value = this.p1.score;
    this.display2.value = this.p2.score;

    this.updateBallMovement();

    this.updateScore();
  }

  updateBallMovement() {
    // ball can't move beyond the one second MRU resolution, lest we miss where the paddles are
    // if ((this.ballSerial - this.paddleSerial == 10)) {
    //   return;
    // }
    if (this.ball.isMovingRight()) {
      // P2 collision detection
      // p2.x behind or at ball && p2.x infront moved ball
      if (this.p2.paddle.x <= this.ball.x + this.ball.width
        && this.p2.paddle.x > this.ball.x - this.ball.vx + this.ball.width) {
        const collisionDiff = this.ball.x + this.ball.width - this.p2.paddle.x;
        const k = collisionDiff / this.ball.vx;
        const y = this.ball.vy * k + (this.ball.y - this.ball.vy);

        // collides with right paddle
        if (y >= this.p2.paddle.y && y + this.ball.height <= this.p2.paddle.y + this.p2.paddle.height) {
          this.ball.x = this.p2.paddle.x - this.ball.width;
          this.ball.y = Math.floor(this.ball.y - this.ball.vy + this.ball.vy * k);
          this.ball.vx = -this.ball.vx;
          this.ball.vy = this.calculateBounceDirection(this.ball.y - this.p2.paddle.y);
        }
      }
    } else { // ball moves left
      // P1 collision detection
      if (this.p1.paddle.x + this.p1.paddle.width >= this.ball.x) {
        const collisionDiff = this.p1.paddle.x + this.p1.paddle.width - this.ball.x;
        const k = collisionDiff / -this.ball.vx;
        const y = this.ball.vy * k + (this.ball.y - this.ball.vy);

        // collides with the left paddle
        if (y >= this.p1.paddle.y && y + this.ball.height <= this.p1.paddle.y + this.p1.paddle.height) {
          this.ball.x = this.p1.paddle.x + this.p1.paddle.width;
          this.ball.y = Math.floor(this.ball.y - this.ball.vy + this.ball.vy * k);
          this.ball.vx = -this.ball.vx;
          this.ball.vy = this.calculateBounceDirection(this.ball.y - this.p1.paddle.y);
        }
      }
    }

    // Ball Top and bottom collision
    if ((this.ball.vy < 0 && this.ball.y < 0)
    || (this.ball.vy > 0 && this.ball.y + this.ball.height > this.height)) {
      this.ball.vy = -this.ball.vy;
    }
    this.ballSerial++;
  }

  updateScore() {
    if (this.ball.x >= this.width) {
      this.score(this.p1);
    } else if (this.ball.x + this.ball.width <= 0) {
      this.score(this.p2);
    }
    if (this.p1.score === this.maxScore) {
      this.won = 1;
    } else if (this.p2.score === this.maxScore) {
      this.won = 2;
    }
  }
}

export default Game;
