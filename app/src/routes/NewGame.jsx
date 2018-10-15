import React, { Component } from 'react';
import web3 from '../eth/web3';
import Pong from '../web3Contracts/Pong';

class NewGame extends Component {
  constructor(props) {
    super(props);
    this.state = {
      account: '',
      maxScore: 100,
      teamA: '',
      teamB: '',
      matchName: '',
      startMinutes: 5,
    };
  }

  async componentWillMount() {
    const $this = this;
    web3.eth.getAccounts((error, accounts) => {
      if (!error) {
        this.setState({
          account: accounts[0],
        });
        $this.fetchGames();
      } else {
        console.error(error);
      }
    });
  }

  async fetchGames() {
    const $this = this;

    const eventFilterConfig = {
      fromBlock: 0,
      toBlock: 'latest',
    };

    Pong.socket.getPastEvents('NewGame', eventFilterConfig, async (err) => {
      if (err) {
        $this.handleEventError(err);
      } else {
        Pong.socket.events.NewGame(eventFilterConfig)
          .on('data', $this.handleNewGame)
          .on('error', $this.handleEventErr);
      }
    });

    // console.log('SEND FROM ACCOUNT: ', this.state.account)

    // const tx = await Pong.contract.methods.newGame(100, 'Junk1', 'Junk2').send({ from: this.state.account })
    // console.log('NEW GAME CREATED: ', tx)
  }

  handleNewGame(data) {
    console.log('NEW GAME: ', data);
  }

  handleEventErr(err) {
    console.error('EVENT ERR: ', err);
  }

  handleMaxScoreChanged(e) {
    this.setState({ maxScore: e.target.value });
  }

  handleTeamAChanged(e) {
    this.setState({ teamA: e.target.value });
  }

  handleMatchNameChanged(e) {
    this.setState({ matchName: e.target.value });
  }

  handleTeamBChanged(e) {
    this.setState({ teamB: e.target.value });
  }

  handleStartTimeChanged(e) {
    this.setState({ startMinutes: e.target.value });
  }

  async handleCreateNewGame() {
    console.log(this.state.maxScore,
      this.state.teamA,
      this.state.teamB,
      web3.utils.sha3(this.state.matchName),
      parseInt(this.state.startMinutes, 10) * 60);
    const tx = await Pong.contract.methods.newGame(
      this.state.maxScore,
      this.state.teamA,
      this.state.teamB,
      web3.utils.sha3(this.state.matchName),
      parseInt(this.state.startMinutes, 10) * 60,
    ).send({ from: this.state.account });
    console.log('new game created: ', tx);
    this.props.history.push('/');
  }

  render() {
    return (
      <div className="row">
        <div className="col-md-3">
          <img className="gifCat" src="https://media0.giphy.com/media/vcYJ10AVGFZbG/giphy.gif" />
        </div>
        <div className="col-md-6">

          <div className="text-input-group">
            <div className="text-input-label">
Max score:
            </div>
            <input value={this.state.maxScore} onChange={this.handleMaxScoreChanged.bind(this)} />
          </div>

          <div className="text-input-group">
            <div className="text-input-label">
Match Name:
            </div>
            <input value={this.state.matchName} onChange={this.handleMatchNameChanged.bind(this)} />
          </div>

          <div className="text-input-group">
            <div className="text-input-label">
Team A:
            </div>
            <input value={this.state.teamA} onChange={this.handleTeamAChanged.bind(this)} />
          </div>

          <div className="text-input-group">
            <div className="text-input-label">
Team B:
            </div>
            <input value={this.state.teamB} onChange={this.handleTeamBChanged.bind(this)} />
          </div>

          <div className="text-input-group">
            <div className="text-input-label">
Start Minutes:
            </div>
            <input value={this.state.startMinutes} onChange={this.handleStartTimeChanged.bind(this)} />
          </div>

          <div className="btn create-new-game-btn" onClick={this.handleCreateNewGame.bind(this)}>
            Create new game
          </div>
        </div>
        <div className="col-md-3">
          <img className="gifCat" src="https://media0.giphy.com/media/vcYJ10AVGFZbG/giphy.gif" />
        </div>
      </div>
    );
  }
}

export default NewGame;
