import React, { Component } from 'react'
import web3 from '../eth/web3'
import Pong from '../web3Contracts/Pong'
import PongCanvas from './PongCanvas'

class Game extends Component {

  constructor(props) {
    super(props)
    this.state = {
      account: '',
      publicAddress: '',
      privateKey: '',
      teamA: '',
      teamB: '',
      topic: '',
      newParticipantName: '',
      teamAParticipants: [],
      teamBParticipants: []
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
      teamB: game.teamB,
      topic: game.topic
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
    if (data.returnValues.gameIndex == this.props.match.params.gameIndex) {
      const arrayName = parseInt(data.returnValues.participantIndex) % 2 == 0 ? 'teamAParticipants' : 'teamBParticipants'
      let participants = this.state[arrayName]
      participants.push(data.returnValues)
      let newState = {}
      newState[arrayName] = participants
      this.setState(newState)
    }
  }

  handleEventErr (err) {
    console.error('EVENT ERR: ', err)
  }

  handleNewParticipantNameChanged (e) {
    this.setState({ newParticipantName: e.target.value })
  }

  async handleJoinGameClicked () {
    const acct = web3.eth.accounts.create()

    this.setState({
      publicAddress: acct.address,
      privateKey: acct.privateKey
    })

    const tx = await Pong.contract.methods.joinGame(
      this.props.match.params.gameIndex,
      acct.address,
      this.state.newParticipantName
    ).send({ from: this.state.account })
    console.log('new participant added: ', tx)
  }

  renderParticipantList (listName, i) {
    return (
      <div>
        {
          this.state[listName].map((participant, i) => {
            return (
              <div className="participant-info" key={i}>
                <div className="participant-name">{participant.name}</div>
                <div className="participant-addr">{participant.user}</div>
              </div>
            )
          })
        }
      </div>
    )
  }

  render () {
    return (
      <div className="container">
        <div className="join-game-form">
          <div className="join-game-label">Your name:</div>
          <input value={this.state.newParticipantName} onChange={this.handleNewParticipantNameChanged.bind(this)}/>
          <div className="btn" onClick={this.handleJoinGameClicked.bind(this)}>Join game</div>
        </div>
        <br /><br />

        <div className="row">
          <div className="col-xs-6 text-center participant-list-title">Team A: {this.state.teamA}</div>
          <div className="col-xs-6 text-center participant-list-title">Team B: {this.state.teamB}</div>
        </div>
        <div>
          <div className="participants-list">
            {this.renderParticipantList('teamAParticipants')}
          </div>
          <div className="participants-list">
            {this.renderParticipantList('teamBParticipants')}
          </div>
        </div>

        <PongCanvas 
          topic={this.state.topic}
          privateKey={this.state.privateKey}
          teamAParticipants={this.state.teamAParticipants}
          teamBParticipants={this.state.teamBParticipants}/> />
      </div>
    )
  }

}

export default Game
