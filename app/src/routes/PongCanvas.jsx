import React, { Component } from 'react'
import swarm from '../swarm'

const keyUpCode = 65;
const keyDownCode = 81;

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
        if (e.keyCode == keyUpCode || e.keyCode == keyDownCode) {
          this.lastKeyPressedTime = currentTime
        }
        let keyState = 0
        if (e.keyCode == keyUpCode) {
          keyState = 1
        } else if (e.keyCode == keyDownCode) {
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
    return this.isPressed(keyUpCode) === true
  }

  isDownPressed () {
    return this.isPressed(keyUpCode) === true
  }

  isPressed (key) {
    return this.pressedKeys[key] ? true : false
  }
}

class Paddle {
  constructor (x, y, players) {
    this.x = x
    this.y = y
    this.players = players // [] //TODO: Do we really need that
    this.width = 2
    this.height = 40
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
    this.maxScore = gameManager.maxScore
    this.context = canvas.getContext('2d')
    this.context.fillStyle = 'white'
    //this.keys = new KeyListener(gameManager)

    // display number
    this.display1 = new ValueDisplay(this.width / 4, 25)
    this.display2 = new ValueDisplay(this.width * 3 / 4, 25)

    // paddleSerial increments by 10 every time (both) the paddles' position is updated
    // ballSerial increments by 1 every time the ball's position is updated
    this.paddleSerial = 0;
    this.ballSerial = 0;
    this.won = 0;

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

/*  getDirection () {
    if (this.keys.isDownPressed()) {
      return  'DOWN'
    } else if (this.keys.isUpPressed()) {
      return 'UP'
    }

    return 'NOTHING'
  }
*/
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
    console.log('setnextmove', playerNumber, direction, velocity)
    if (direction === 'DOWN') { // DOWN
      player.paddle.y = Math.min(this.height - player.paddle.height, player.paddle.y + velocity*6)
    } else if (direction === 'UP') { // UP
      player.paddle.y = Math.max(0, player.paddle.y - velocity*6)
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
    // ball can't move beyond the one second MRU resolution, lest we miss where the paddles are
    // if ((this.ballSerial - this.paddleSerial == 10)) {
	  //   return;
    // }
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
    this.ballSerial++;
  }

  updateScore () {
    if (this.ball.x >= this.width) {
      this.score(this.p1)
    } else if (this.ball.x + this.ball.width <= 0) {
      this.score(this.p2)
    }
    if (this.p1.score == this.maxScore) {
       this.won = 1;
    } else if (this.p2.score == this.maxScore) {
       this.won = 2;
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
  constructor (startTime, maxScore) {
    this.started = false;
    this.startTime = startTime;
    this.maxScore = maxScore;
    this.game = new Game(this)
    this.stateManager = new StateManager()
    this.state = this.stateManager.getInitialState()
    this.teamVotes = {};
    this.teamADelta =0;
    this.teamBDelta =0;
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

  setTeamAParticipants (teamAParticipants) {
    if (!this.teamAParticipants) {
      this.teamAParticipants = teamAParticipants
    }
  }

  setTeamBParticipants (teamBParticipants) {
    if (!this.teamBParticipants) {
      this.teamBParticipants = teamBParticipants
    }
  }

  dataUpdateLoop () {
    //let direction = this.game.getDirection()
    const currentTime = Math.floor(new Date().getTime() / 1000)
    /*if (direction == 'NOTHING' && currentTime != this.game.keys.lastKeyPressedTime) {
      if (this.topic && this.privateKey) {
        console.log('Sending: 0')
        swarm.updateResource(this.privateKey, this.topic, 0)
      }
    }*/
    this.getDataForParticipants(this.teamAParticipants, 'A')
    this.getDataForParticipants(this.teamBParticipants, 'B')
  }

  handleTeamData (team, result) {
    console.log('Result', team, result);
    if (team == 'A'){
      for (var i = 0; i < result.length; i++) {
        if (result[i] == 1) {
  	      this.teamADelta ++;
        } else if (result[i] == 2){
          this.teamADelta --;
        }
      }
      this.teamVotes.a = 1;
      if (this.teamVotes.a && this.teamVotes.b) {
      	this.game.setNextMove(this.state.playerNumber1, this.stateManager.getDirection(this.teamADelta), this.teamADelta);
      	this.game.setNextMove(this.state.playerNumber2, this.stateManager.getDirection(this.teamBDelta), this.teamBDelta);
      	this.game.paddleSerial+=10;
      	this.teamVotes = {};
      	this.teamADelta = 0;
        this.teamBDelta = 0;
      }
    } else {
      for (var i = 0; i < result.length; i++) {
        if (result[i] == 1) {
  	      this.teamBDelta ++;
        } else if (result[i] == 2){
          this.teamBDelta --;
        }
      }
      this.teamVotes.b = 1;
      if (this.teamVotes.a && this.teamVotes.b) {
      	this.game.setNextMove(this.state.playerNumber1, this.stateManager.getDirection(this.teamADelta), this.teamADelta);
      	this.game.setNextMove(this.state.playerNumber2, this.stateManager.getDirection(this.teamBDelta), this.teamBDelta);
      	this.game.paddleSerial+=10;
      	this.teamVotes = {};
        this.teamADelta = 0;
        this.teamBDelta = 0;
      }
    }
  }

  getDataForParticipants (participantsList, team) {
    var topic = this.topic;
    var self = this;
    return Promise.all(participantsList.map((p) =>{
      //console.log(p);
      return swarm.getResource(topic, p.user)
    })).then((result) => {
      this.handleTeamData(team, result);
    }).catch((e) => {
      //console.log('err', e, team, participantsList.length);
    })
  }

  loop () {
    // let direction = this.game.getDirection()
    // this.stateManager.sendMove(direction)
    this.state = this.stateManager.getState()
    //this.game.setNextMove(this.state.playerNumber1, this.state.direction1, this.state.velocity1)
    //this.game.setNextMove(this.state.playerNumber2, this.state.direction2, this.state.velocity2)
    this.game.update()
    this.game.draw()
  }

  start () {
    this.started = true;
    window.setInterval(() => { this.loop() }, 100)
    window.setInterval(() => { this.dataUpdateLoop() }, 2000)
  }
}

class Pong extends Component {

  constructor(props) {
    super(props)
  }

  componentDidMount () {
    this.gameManager = new GameManager(this.props.startTime, this.props.maxScore)
    var eta_ms = this.gameManager.startTime*1000 - Date.now();
    if (eta_ms > 0)
      window.setTimeout(() => this.gameManager.start(), eta_ms);
    else
      this.gameManager.start();
  }

  render () {
    if (this.gameManager) {
      console.log('Participants A list: ', this.props.teamAParticipants)
      console.log('Participants B list: ', this.props.teamBParticipants)
      this.gameManager.setTopic(this.props.topic)
      this.gameManager.setPrivateKey(this.props.privateKey)
      this.gameManager.setTeamAParticipants(this.props.teamAParticipants)
      this.gameManager.setTeamBParticipants(this.props.teamBParticipants)
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
