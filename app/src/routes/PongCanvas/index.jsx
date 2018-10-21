import React, { Component } from 'react';
import swarm from '../../swarm';

import Game from './Game';

class StateManager {
  // we need swarm and web3 here
  contructor() {
    this.nextMove = 'NOTHING';
  }

  aggregateMovements() {
    // TODO separate two teams
    // get movement of each member
    let velocity = 0;
    for (let i = 0; i < 5; i++) {
      // TODO if up then add positive velocity
      // TODO if down then add minus velocity
      velocity += 1;
      // velocity -= 1
    }
    return {
      velocity1: velocity,
      velocity2: velocity,
    };
  }

  getDirection(velocity) {
    let direction = 'NOTHING';
    if (velocity > 0) {
      direction = 'UP';
    } else if (velocity < 0) {
      direction = 'DOWN';
    }
    return direction;
  }

  getInitialState() {
    return {
      playerNumber1: 1,
      playerNumber2: 2,
      direction1: 'NOTHING',
      direction2: 'NOTHING',
      velocity1: 0,
      velocity2: 0,
    };
  }

  getState() {
    // TODO: get and aggregate real state
    const velocities = this.aggregateMovements();
    const velocity1 = velocities.velocity1;
    const velocity2 = velocities.velocity2;

    const direction1 = this.getDirection(velocity1);
    const direction2 = this.getDirection(velocity2);
    return {
      playerNumber1: 1,
      playerNumber2: 2,
      direction1,
      direction2: this.nextMove, // TODO change to direction2
      velocity1,
      velocity2,
    };
  }

  sendMove(direction) {
    // TODO send real position
    this.nextMove = direction;
  }
}

class GameManager {
  constructor(startTime, maxScore) {
    this.started = false;
    this.startTime = startTime;
    this.maxScore = maxScore;
    this.game = new Game(this);
    this.stateManager = new StateManager();
    this.state = this.stateManager.getInitialState();
    this.teamVotes = {};
    this.teamADelta = 0;
    this.teamBDelta = 0;
  }

  setTopic(topic) {
    if (!this.topic) {
      this.topic = topic;
    }
  }

  setPrivateKey(privateKey) {
    if (!this.privateKey) {
      this.privateKey = privateKey;
    }
  }

  setTeamAParticipants(teamAParticipants) {
    if (!this.teamAParticipants) {
      this.teamAParticipants = teamAParticipants;
    }
  }

  setTeamBParticipants(teamBParticipants) {
    if (!this.teamBParticipants) {
      this.teamBParticipants = teamBParticipants;
    }
  }

  dataUpdateLoop() {
    // let direction = this.game.getDirection()
    /* const currentTime = Math.floor(new Date().getTime() / 1000);
    if (direction === 'NOTHING' && currentTime != this.game.keys.lastKeyPressedTime) {
      if (this.topic && this.privateKey) {
        console.log('Sending: 0')
        swarm.updateResource(this.privateKey, this.topic, 0)
      }
    } */
    this.getDataForParticipants(this.teamAParticipants, 'A');
    this.getDataForParticipants(this.teamBParticipants, 'B');
  }

  handleTeamData(team, result) {
    console.log('Result', team, result);
    if (team === 'A') {
      for (let i = 0; i < result.length; i++) {
        if (result[i] === 1) {
          this.teamADelta++;
        } else if (result[i] === 2) {
          this.teamADelta--;
        }
      }
      this.teamVotes.a = 1;
      if (this.teamVotes.a && this.teamVotes.b) {
        this.game.setNextMove(this.state.playerNumber1, this.stateManager.getDirection(this.teamADelta), this.teamADelta);
        this.game.setNextMove(this.state.playerNumber2, this.stateManager.getDirection(this.teamBDelta), this.teamBDelta);
        this.game.paddleSerial += 10;
        this.teamVotes = {};
        this.teamADelta = 0;
        this.teamBDelta = 0;
      }
    } else {
      for (let i = 0; i < result.length; i++) {
        if (result[i] === 1) {
          this.teamBDelta++;
        } else if (result[i] === 2) {
          this.teamBDelta--;
        }
      }
      this.teamVotes.b = 1;
      if (this.teamVotes.a && this.teamVotes.b) {
        this.game.setNextMove(this.state.playerNumber1, this.stateManager.getDirection(this.teamADelta), this.teamADelta);
        this.game.setNextMove(this.state.playerNumber2, this.stateManager.getDirection(this.teamBDelta), this.teamBDelta);
        this.game.paddleSerial += 10;
        this.teamVotes = {};
        this.teamADelta = 0;
        this.teamBDelta = 0;
      }
    }
  }

  getDataForParticipants(participantsList, team) {
    const topic = this.topic;
    return Promise.all(participantsList.map(p => swarm.getResource(topic, p.user))).then((result) => {
      this.handleTeamData(team, result);
    }).catch((e) => {
      console.error(e, team, participantsList.length);
    });
  }

  loop() {
    // let direction = this.game.getDirection()
    // this.stateManager.sendMove(direction)
    this.state = this.stateManager.getState();
    // this.game.setNextMove(this.state.playerNumber1, this.state.direction1, this.state.velocity1)
    // this.game.setNextMove(this.state.playerNumber2, this.state.direction2, this.state.velocity2)
    this.game.update();
    this.game.draw();
  }

  start() {
    this.started = true;
    window.setInterval(() => { this.loop(); }, 100);
    window.setInterval(() => { this.dataUpdateLoop(); }, 2000);
  }
}

class Pong extends Component {
  componentDidMount() {
    this.gameManager = new GameManager(this.props.startTime, this.props.maxScore);
    const eta_ms = this.gameManager.startTime * 1000 - Date.now();
    if (eta_ms > 0) window.setTimeout(() => this.gameManager.start(), eta_ms);
    else this.gameManager.start();
  }

  render() {
    if (this.gameManager) {
      this.gameManager.setTopic(this.props.topic);
      this.gameManager.setPrivateKey(this.props.privateKey);
      this.gameManager.setTeamAParticipants(this.props.teamAParticipants);
      this.gameManager.setTeamBParticipants(this.props.teamBParticipants);
    }
    return (
      <div>
        <div className="row text-center">
          <canvas id="game" ref="game" width="1024" height="512" />
        </div>
        <div id="timeBox" />
      </div>
    );
  }
}

export default Pong;
