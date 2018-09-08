class State {
  constructor (timeStamp) {
    this.ball = {}
    this.paddlePlayer1 = {}
    this.paddlePlayer2 = {}
    this.timeStamp = timeStamp
  }

  setBall (ball) {
    this.ball = ball
  }

  setPaddlePlayer1 (paddle) {
    this.paddlePlayer1 = paddle
  }

  setPaddlePlayer2 (paddle) {
    this.paddlePlayer2 = paddle
  }
}

class Ball {
  constructor (x, y, vx, vy) {
    this.x = x
    this.y = y
    this.vx = vx
    this.vy = vy
    this.width = 4
    this.height = 4
  }

  draw (p) {
    p.fillRect(this.x, this.y, this.width, this.height)
  }

  updatePosition () {
    this.x += this.vx
    this.y += this.vy
  }

  isMovingRight () {
    return this.vx > 0
  }
}

class Display {
  constructor (x, y) {
    this.x = x
    this.y = y
    this.value = 0
  }
  draw (p) {
    p.fillText(this.value, this.x, this.y)
  }
}

class KeyListener {
  constructor () {
    this.pressedKeys = []

    this.keydown = function (e) {
      this.pressedKeys[e.keyCode] = true
    }

    this.keyup = function (e) {
      this.pressedKeys[e.keyCode] = false
    }

    document.addEventListener('keydown', this.keydown.bind(this))
    document.addEventListener('keyup', this.keyup.bind(this))
  }

  isUpPressed () {
    return this.isPressed(38) === true
  }

  isDownPressed () {
    return this.isPressed(40) === true
  }

  isPressed (key) {
    return this.pressedKeys[key] ? true : false
  }

  addKeyPressListener (keyCode, callback) {
    document.addEventListener('keypress', function (e) {
      if (e.keyCode === keyCode) {
        callback(e)
      }
    })
  }
}

class Paddle {
  constructor (x, y, players) {
    this.x = x
    this.y = y
    this.players = players // []
    this.width = 2
    this.height = 28
    this.score = 0
  }

  draw (p) {
    p.fillRect(this.x, this.y, this.width, this.height)
  }
}

class Player {
  constructor (isPlayer1, name) {
    this.player = isPlayer1 ? 1 : 2
    this.name = name
  }
}

class Game {
  constructor () {
    const canvas = document.getElementById('game')
    this.width = canvas.width
    this.height = canvas.height
    this.context = canvas.getContext('2d')
    this.context.fillStyle = 'white'
    this.keys = new KeyListener()
    // Paddle 1
    this.p1 = this.getInitialPaddle1()
    // Display 1
    this.display1 = new Display(this.width / 4, 25)
    // Paddle 2
    this.p2 = this.getInitialPaddle2()

    // Display 2
    this.display2 = new Display(this.width * 3 / 4, 25)
    // Ball
    let ballX = this.width / 2
    let ballY = this.width / 2
    this.ball = new Ball(ballX, ballY)
    // TODO: Define just one direction
    this.ball.vy = Math.floor(Math.random() * 12 - 6)
    this.ball.vx = 7 - Math.abs(this.ball.vy)
  }

  /// PUBLIC
  draw () {
    drawTime()
    this.drawPlayField()
    this.drawMiddleLine()

    this.ball.draw(this.context)

    this.p1.draw(this.context)
    this.p2.draw(this.context)
    this.display1.draw(this.context)
    this.display2.draw(this.context)
  }

  drawMiddleLine () {
    this.context.fillRect(this.width / 2, 0, 2, this.height)
  }

  drawPlayField () {
    this.context.clearRect(0, 0, this.width, this.height)
  }

  getInitialPaddle1 () {
    var paddle = new Paddle(5, 0)
    paddle.y = this.height / 2 - paddle.height / 2
    return paddle
  }

  getInitialPaddle2 () {
    var paddle = new Paddle(this.width - 5 - 2, 0)
    paddle.y = this.height / 2 - paddle.height / 2
    return paddle
  }

  score (player) {
    // player scores
    player.score++
    var isPlayer1Winner = player === this.p1

    // set ball position
    this.ball.x = this.width / 2
    this.ball.y = player.y + player.height / 2

    // set ball velocity
    this.ball.vy = Math.floor(Math.random() * 12 - 6)
    this.ball.vx = 7 - Math.abs(this.ball.vy)
    if (isPlayer1Winner) {
      this.ball.vx *= -1
    }
  }

  start () {
    // TODO
    // based on block heights
  }

  update () {
    // upate ball
    this.ball.updatePosition()

    // update Score
    this.display1.value = this.p1.score
    this.display2.value = this.p2.score

    // TODO: We will make this more generic for both players
    // Commented out player one
    // To which Y direction the paddle is moving
    // if (this.keys.isDownPressed())
    //   this.p1.y = Math.min(this.height - this.p1.height, this.p1.y + 4)
    // } else if (this.keys.isUpPressed()) { // UP
    //   this.p1.y = Math.max(0, this.p1.y - 4)
    // }

    this.updatePaddles()


    // Top and bottom collision
    if ((this.ball.vy < 0 && this.ball.y < 0) ||
    (this.ball.vy > 0 && this.ball.y + this.ball.height > this.height)) {
      this.ball.vy = -this.ball.vy
    }

    this.updateScore()
  }

  updatePaddles () {
    // Trace paddle direction
    if (this.keys.isDownPressed()) { // DOWN
      this.p2.y = Math.min(this.height - this.p2.height, this.p2.y + 4)
    } else if (this.keys.isUpPressed()) { // UP
      this.p2.y = Math.max(0, this.p2.y - 4)
    }

    if (this.ball.isMovingRight()) {
      // P2 collision detection
      // p2.x behind or at ball && p2.x infront moved ball
      if (this.p2.x <= this.ball.x + this.ball.width &&
        this.p2.x > this.ball.x - this.ball.vx + this.ball.width) {
        var collisionDiff = this.ball.x + this.ball.width - this.p2.x
        var k = collisionDiff / this.ball.vx
        var y = this.ball.vy * k + (this.ball.y - this.ball.vy)

        // collides with right paddle
        if (y >= this.p2.y && y + this.ball.height <= this.p2.y + this.p2.height) {
          this.ball.x = this.p2.x - this.ball.width
          this.ball.y = Math.floor(this.ball.y - this.ball.vy + this.ball.vy * k)
          this.ball.vx = -this.ball.vx
        }
      }
    } else { // ball moves left
      // P1 collision detection
      if (this.p1.x + this.p1.width >= this.ball.x) {
        var collisionDiff = this.p1.x + this.p1.width - this.ball.x
        var k = collisionDiff / -this.ball.vx
        var y = this.ball.vy * k + (this.ball.y - this.ball.vy)

        // collides with the left paddle
        if (y >= this.p1.y && y + this.ball.height <= this.p1.y + this.p1.height) {
          this.ball.x = this.p1.x + this.p1.width
          this.ball.y = Math.floor(this.ball.y - this.ball.vy + this.ball.vy * k)
          this.ball.vx = -this.ball.vx
        }
      }
    }
  }

  updateScore () {
    if (this.ball.x >= this.width) {
      this.score(this.p1)
    } else if (this.ball.x + this.ball.width <= 0) {
      this.score(this.p2)
    }
  }
}

class StateManager {
    // we need swarm and web3 here
  contructor () {

  }

  // getState
}

const game = new Game()
const stateManager = new StateManager()

function drawTime () {
  document.getElementById('timeBox').innerHTML = Math.round(new Date().getTime() / 1000)
}

function MainLoop () {
  // trace and send movement
  // get state
  // set state
  // all of above should happen in the the update with the DataFetcher
  game.update()
  game.draw()

  // Call the main loop again at a frame rate of 30fps
  setTimeout(MainLoop, 100)
}

// Start the game execution
MainLoop()
