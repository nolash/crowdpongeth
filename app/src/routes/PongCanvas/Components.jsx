class Ball {
  constructor(x, y, vx, vy) {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.width = 4;
    this.height = 4;
  }

  draw(p) {
    p.fillRect(this.x, this.y, this.width, this.height);
  }

  setNextPosition() {
    this.x += this.vx;
    this.y += this.vy;
  }

  isMovingRight() {
    return this.vx > 0;
  }
}

class ValueDisplay {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.value = 0;
  }

  draw(context) {
    context.fillText(this.value, this.x, this.y);
  }
}

class Player {
  constructor(playerNumber, name, paddle) {
    this.playerNumber = playerNumber;
    this.name = name;
    this.paddle = paddle;
    this.score = 0;
  }
}

class Paddle {
  constructor(x, y, players) {
    this.x = x;
    this.y = y;
    this.players = players; // [] //TODO: Do we really need that
    this.width = 2;
    this.height = 40;
    this.score = 0;
  }

  draw(context) {
    context.fillRect(this.x, this.y, this.width, this.height);
  }
}

module.exports = {
  Ball,
  ValueDisplay,
  Player,
  Paddle,
};
