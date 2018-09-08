import React, { Component } from 'react'
import web3 from '../eth/web3'
import Pong from '../web3Contracts/Pong'

class Game extends Component {

  constructor(props) {
    super(props)
    this.state = {
      account: '',
      teamA: '',
      teamB: '',
      newParticipantName: '',
      participants: []
    }
  }

  async componentWillMount () {
    const $this = this
    web3.eth.getAccounts((error, accounts) => {
      if (!error) {
        this.setState({
          account: accounts[0]
        })
      } else {
        console.error(error)
      }
    })

    this.fetchGameInfo()
    this.fetchParticipants()
  }

  async fetchGameInfo () {
    const game = await Pong.contract.methods.games(this.props.match.params.gameIndex).call()
    this.setState({
      teamA: game.teamA,
      teamB: game.teamB
    })
  }

  async fetchParticipants () {
    const $this = this

    let eventFilterConfig = {
      fromBlock: 0,
      toBlock: 'latest'
    }

    Pong.socket.getPastEvents('NewParticipant', eventFilterConfig, async (err, events) => {
      if (err) {
        $this.handleEventError(err)
      } else {
        Pong.socket.events['NewParticipant'](eventFilterConfig)
          .on('data', $this.handleNewParticipant.bind($this))
          .on('error', $this.handleEventErr.bind($this))
      }
    })
  }

  handleNewParticipant (data) {
    console.log('NEW PARTICIPANT: ', data)
    let participants = this.state.participants
    participants.push(data.returnValues)
    this.setState({
      participants
    })
  }

  handleEventErr (err) {
    console.error('EVENT ERR: ', err)
  }

  handleNewParticipantNameChanged (e) {
    this.setState({ newParticipantName: e.target.value })
  }

  async handleJoinGameClicked () {
    const tx = await Pong.contract.methods.joinGame(
      this.props.match.params.gameIndex,
      this.state.account,
      this.state.newParticipantName
    ).send({ from: this.state.account })
    console.log('new participant added: ', tx)
  }

  render () {
    return (
      <div>
        <div className="join-game-form">
          <div className="join-game-label">Your name:</div>
          <input value={this.state.newParticipantName} onChange={this.handleNewParticipantNameChanged.bind(this)}/>
          <div className="btn" onClick={this.handleJoinGameClicked.bind(this)}>Join game</div>
        </div>
        <br /><br />

        <div>
          <div className="participant-list-title">{this.state.teamA}</div>
          <div className="participant-list-title">{this.state.teamB}</div>
        </div>
        <div>
          <div className="participants-list">
            <div>one</div>
            <div>two</div>
            <div>three</div>
          </div>
          <div className="participants-list">
            <div>asdfsadf</div>
            <div>asdf</div>
            <div>tasdgasdgasdghree</div>
          </div>
        </div>
      </div>
    )
  }

}

export default Game
