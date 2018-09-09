import React, { Component } from 'react'
import swarm from '../swarm'

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

  setNextPosition () {
    this.x += this.vx
    this.y += this.vy
  }

  isMovingRight () {
    return this.vx > 0
  }
}

class ValueDisplay {
  constructor (x, y) {
    this.x = x
    this.y = y
    this.value = 0
  }
  draw (context) {
    context.fillText(this.value, this.x, this.y)
  }
}

class KeyListener {

  constructor (gameManager) {
    this.gameManager = gameManager
    this.lastKeyPressedTime = 0
    this.pressedKeys = []

    this.keydown = function (e) {
      this.pressedKeys[e.keyCode] = true
    }

    this.keyup = function (e) {
      this.pressedKeys[e.keyCode] = false
      const currentTime = Math.floor(new Date().getTime() / 1000)
      if (currentTime != this.lastKeyPressedTime) {
        if (e.keyCode == 38 || e.keyCode == 40) {
          this.lastKeyPressedTime = currentTime
        }
        let keyState = 0
        if (e.keyCode == 38) {
          keyState = 1
        } else if (e.keyCode == 40) {
          keyState = 2
        }
        if (this.gameManager.topic && this.gameManager.privateKey && keyState !== 0) {
          console.log(`Sending: ${keyState}`)
          swarm.updateResource(
            this.gameManager.privateKey,
            this.gameManager.topic,
            keyState
          )
        }
      }
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
    this.players = players // [] //TODO: Do we really need that
    this.width = 2
    this.height = 28
    this.score = 0
  }

  draw (context) {
    context.fillRect(this.x, this.y, this.width, this.height)
  }
}

class Player {
  constructor (playerNumber, name, paddle) {
    this.playerNumber = playerNumber
    this.name = name
    this.paddle = paddle
    this.score = 0
  }
}

class Game {
  constructor (gameManager) {
    const canvas = document.getElementById('game')
    this.width = canvas.width
    this.height = canvas.height
    this.context = canvas.getContext('2d')
    this.context.fillStyle = 'white'
    this.keys = new KeyListener(gameManager)

    // display number
    this.display1 = new ValueDisplay(this.width / 4, 25)
    this.display2 = new ValueDisplay(this.width * 3 / 4, 25)

    let paddle1 = this.getInitialPaddle1()
    this.p1 = new Player(1, 'SomeName1', paddle1)
    let paddle2 = this.getInitialPaddle2()
    this.p2 = new Player(2, 'SomeName2', paddle2)

    // Display 2
    // Ball
    let ballX = this.width / 2
    let ballY = this.height / 2
    this.ball = new Ball(ballX, ballY)
    // this.ball.vy = Math.floor(Math.random() * 12 - 6)
    this.ball.vx = 5
    this.ball.vy = 0
  }

  /// PUBLIC
  calculateBounceDirection (collisionPoint) {
    const paddleMiddle = this.p1.paddle.height / 2
    const direction = collisionPoint - paddleMiddle
    // normalize
    return Math.round(((direction - 0) / paddleMiddle) * 5)
  }

  draw () {
    this.drawTime()
    this.drawPlayField()
    this.drawMiddleLine()

    this.ball.draw(this.context)

    this.p1.paddle.draw(this.context)
    this.p2.paddle.draw(this.context)

    this.display1.draw(this.context)
    this.display2.draw(this.context)
  }

  drawMiddleLine () {
    this.context.fillRect(this.width / 2, 0, 2, this.height)
  }

  drawPlayField () {
    this.context.clearRect(0, 0, this.width, this.height)
  }

  drawTime () {
    document.getElementById('timeBox').innerHTML = 'Time = '+Math.round(new Date().getTime() / 1000)
  }

  getDirection () {
    if (this.keys.isDownPressed()) {
      return  'DOWN'
    } else if (this.keys.isUpPressed()) {
      return 'UP'
    }

    return 'NOTHING'
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
    player.score++
    var isPlayer1Winner = player.playerNumber === this.p1.playerNumber

    // set ball position
    this.ball.x = this.width / 2
    this.ball.y = player.paddle.y + player.paddle.height / 2

    // set ball velocity
    this.ball.vx = 5
    this.ball.vy = 0

    if (isPlayer1Winner) {
      this.ball.vx *= -1
    }
  }

  setNextMove (playerNumber, direction, velocity) {
    let player = playerNumber === 1 ? this.p1 : this.p2

    if (direction === 'DOWN') { // DOWN
      player.paddle.y = Math.min(this.height - player.paddle.height, player.paddle.y + velocity)
    } else if (direction === 'UP') { // UP
      player.paddle.y = Math.max(0, player.paddle.y - velocity)
    }
  }

  update () {
    // upate ball
    this.ball.setNextPosition()

    // update Score
    this.display1.value = this.p1.score
    this.display2.value = this.p2.score

    this.updateBallMovement()

    this.updateScore()
  }

  updateBallMovement () {
    if (this.ball.isMovingRight()) {
      // P2 collision detection
      // p2.x behind or at ball && p2.x infront moved ball
      if (this.p2.paddle.x <= this.ball.x + this.ball.width &&
        this.p2.paddle.x > this.ball.x - this.ball.vx + this.ball.width) {
        var collisionDiff = this.ball.x + this.ball.width - this.p2.paddle.x
        var k = collisionDiff / this.ball.vx
        var y = this.ball.vy * k + (this.ball.y - this.ball.vy)

        // collides with right paddle
        if (y >= this.p2.paddle.y && y + this.ball.height <= this.p2.paddle.y + this.p2.paddle.height) {
          this.ball.x = this.p2.paddle.x - this.ball.width
          this.ball.y = Math.floor(this.ball.y - this.ball.vy + this.ball.vy * k)
          this.ball.vx = -this.ball.vx
          this.ball.vy = this.calculateBounceDirection(this.ball.y - this.p2.paddle.y)
        }
      }
    } else { // ball moves left
      // P1 collision detection
      if (this.p1.paddle.x + this.p1.paddle.width >= this.ball.x) {
        var collisionDiff = this.p1.paddle.x + this.p1.paddle.width - this.ball.x
        var k = collisionDiff / -this.ball.vx
        var y = this.ball.vy * k + (this.ball.y - this.ball.vy)

        // collides with the left paddle
        if (y >= this.p1.paddle.y && y + this.ball.height <= this.p1.paddle.y + this.p1.paddle.height) {
          this.ball.x = this.p1.paddle.x + this.p1.paddle.width
          this.ball.y = Math.floor(this.ball.y - this.ball.vy + this.ball.vy * k)
          this.ball.vx = -this.ball.vx
          this.ball.vy = this.calculateBounceDirection(this.ball.y - this.p1.paddle.y)
        }
      }
    }

    // Ball Top and bottom collision
    if ((this.ball.vy < 0 && this.ball.y < 0) ||
    (this.ball.vy > 0 && this.ball.y + this.ball.height > this.height)) {
      this.ball.vy = -this.ball.vy
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
    this.nextMove = 'NOTHING'
  }

  aggregateMovements () {
    // TODO separate two teams
    // get movement of each member
    let velocity = 0
    for (let i = 0; i < 5; i++) {
      // TODO if up then add positive velocity
      // TODO if down then add minus velocity
      velocity += 1
      // velocity -= 1
    }
    return {
      velocity1: velocity,
      velocity2: velocity
    }
  }

  getDirection (velocity) {
    let direction = 'NOTHING'
    if (velocity > 0) {
      direction = 'UP'
    } else if (velocity < 0) {
      direction = 'DOWN'
    }
    return direction
  }

  getInitialState () {
    return {
      playerNumber1: 1,
      playerNumber2: 2,
      direction1: 'NOTHING',
      direction2: 'NOTHING',
      velocity1: 0,
      velocity2: 0
    }
  }
  getState () {
    // TODO: get and aggregate real state
    const velocities = this.aggregateMovements()
    let velocity1 = velocities.velocity1
    let velocity2 = velocities.velocity2

    const direction1 = this.getDirection(velocity1)
    const direction2 = this.getDirection(velocity2)
    return {
      playerNumber1: 1,
      playerNumber2: 2,
      direction1: direction1,
      direction2: this.nextMove, // TODO change to direction2
      velocity1: velocity1,
      velocity2: velocity2
    }
  }
  sendMove (direction) {
    // TODO send real position
    this.nextMove = direction
  }
}

class GameManager {
  constructor () {
    this.game = new Game(this)
    this.stateManager = new StateManager()
    this.state = this.stateManager.getInitialState()
  }

  setTopic (topic) {
    if (!this.topic) {
      this.topic = topic
    }
  }

  setPrivateKey (privateKey) {
    if (!this.privateKey) {
      this.privateKey = privateKey
    }
  }

  dataUpdateLoop () {
    let direction = this.game.getDirection()
    const currentTime = Math.floor(new Date().getTime() / 1000)
    if (direction == 'NOTHING' && currentTime != this.game.keys.lastKeyPressedTime) {
      if (this.topic && this.privateKey) {
        console.log('Sending: 0')
        swarm.updateResource(this.privateKey, this.topic, 0)
      }
    }
  }

  loop () {
    // let direction = this.game.getDirection()
    // this.stateManager.sendMove(direction)
    this.state = this.stateManager.getState()
    this.game.setNextMove(this.state.playerNumber1, this.state.direction1, this.state.velocity1)
    this.game.setNextMove(this.state.playerNumber2, this.state.direction2, this.state.velocity2)
    this.game.update()
    this.game.draw()
  }

  start () {
    window.setInterval(() => { this.loop() }, 100)
    window.setInterval(() => { this.dataUpdateLoop() }, 1000)
  }
}

class Pong extends Component {

  constructor(props) {
    super(props)
  }

  componentDidMount () {
    this.gameManager = new GameManager()
    this.gameManager.start()
  }

  render () {
    if (this.gameManager) {
      console.log('Particiaptns list: ', this.props.teamAParticipants)
      this.gameManager.setTopic(this.props.topic)
      this.gameManager.setPrivateKey(this.props.privateKey)
    }
    return (
      <div>
        <div className="row text-center">
          <canvas id="game" ref="game" width="1024" height="512"></canvas>
        </div>
        <div id='timeBox'></div>
      </div>
    )
  }

}

export default Pong
