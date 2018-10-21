import React, { Component } from 'react';
import swarm from '../../swarm';

import Game from './Game';

class StateManager {
  constructor () {
    this.state = {
      player1: {
        number: 1,
        letter: 'A',
        direction: 'NOTHING',
        velocity: 1,
      },
      player2: {
        number: 2,
        letter: 'B',
        direction: 'NOTHING',
        velocity: 1,
      }
    };
  }

  getState() {
    return this.state;
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

  nextState(velocities) {
    this.state = {
      player1: Object.assign({}, this.state.player1, {
        velocity: Math.abs(velocities.A),
        direction: this.getDirection(velocities.A),
      }),
      player2: Object.assign({}, this.state.player2, {
        velocity: Math.abs(velocities.B),
        direction: this.getDirection(velocities.B),
      }),
    };
  }
}

class GameManager {
  constructor(startTime, maxScore) {
    this.started = false;
    this.startTime = startTime;
    this.maxScore = maxScore;
    this.game = new Game(this);
    this.stateManager = new StateManager();
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
    // This does not make sense - it should depend on a direction of a player team
    // the user is member of
    // let direction = this.game.getDirection() 
    /* const currentTime = Math.floor(new Date().getTime() / 1000);
    if (direction === 'NOTHING' && currentTime != this.game.keys.lastKeyPressedTime) {
      if (this.topic && this.privateKey) {
        console.log('Sending: 0')
        swarm.updateResource(this.privateKey, this.topic, 0)
      }
    } */
    Promise.all([
      this.getDataForParticipants(this.teamAParticipants, 'A'),
      this.getDataForParticipants(this.teamBParticipants, 'B')
    ]).then((movements) => {
      this.handleTeamData({
        A: movements[0],
        B: movements[1],
      });
    });
  }

  handleTeamData(results) {
    // Handle edge case when somethign goes awry for one team
    if (!results.A || !results.B) {
      return;
    }
    const deltas = {
      A: 0,
      B: 0,
    }
    for (let i = 0; i < results.A.length; i++) {
      if (results.A[i] === 1) {
        deltas.A++;
      } else if (results.A[i] === 2) {
        deltas.A--;
      }
    }
    for (let i = 0; i < results.B.length; i++) {
      if (results.B[i] === 1) {
        deltas.B++;
      } else if (results.B[i] === 2) {
        deltas.B--;
      }
    }
    this.stateManager.nextState(deltas);
  }

  getDataForParticipants(participantsList, team) {
    const topic = this.topic;
    return Promise.all(participantsList.map(p => swarm.getResource(topic, p.user)))
      .catch((e) => {
        console.error(e, team, participantsList.length);
      });
  }

  loop() {
    const state = this.stateManager.getState();
    this.game.setNextMove(state.player1.number, state.player1.direction, state.player1.velocity);
    this.game.setNextMove(state.player2.number, state.player2.direction, state.player2.velocity);
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
