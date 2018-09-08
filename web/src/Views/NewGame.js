import React, { Component } from 'react'
import web3 from '../eth/web3'
import Pong from '../web3Contracts/Pong'
import { withRouter } from 'react-router-dom'

class NewGame extends Component {

  constructor(props) {
    super(props)
    this.state = {
      account: '',
      maxScore: 100,
      teamA: '',
      teamB: ''
    }
  }

  async componentWillMount () {
    const $this = this
    web3.eth.getAccounts((error, accounts) => {
      if (!error) {
        this.setState({
          account: accounts[0]
        })
        $this.fetchGames()
      } else {
        console.error(error)
      }
    })
  }

  async fetchGames () {
    const $this = this

    let eventFilterConfig = {
      fromBlock: 0,
      toBlock: 'latest'
    }

    Pong.socket.getPastEvents('NewGame', eventFilterConfig, async (err, events) => {
      if (err) {
        $this.handleEventError(err)
      } else {
        Pong.socket.events['NewGame'](eventFilterConfig)
          .on('data', $this.handleNewGame)
          .on('error', $this.handleEventErr)
      }
    })

    // console.log('SEND FROM ACCOUNT: ', this.state.account)

    // const tx = await Pong.contract.methods.newGame(100, 'Junk1', 'Junk2').send({ from: this.state.account })
    // console.log('NEW GAME CREATED: ', tx)
  }

  handleNewGame (data) {
    console.log('NEW GAME: ', data)
  }

  handleEventErr (err) {
    console.error('EVENT ERR: ', err)
  }

  handleMaxScoreChanged (e) {
    this.setState({ maxScore: e.target.value })
  }

  handleTeamAChanged (e) {
    this.setState({ teamA: e.target.value })
  }

  handleTeamBChanged (e) {
    this.setState({ teamB: e.target.value })
  }

  async handleCreateNewGame () {
    const tx = await Pong.contract.methods.newGame(
      this.state.maxScore,
      this.state.teamA,
      this.state.teamB
    ).send({ from: this.state.account })
    console.log('new game created: ', tx)
    this.props.history.push('/')
  }

  render () {
    return (
      <div>
        <div className="text-input-group">
          <div className="text-input-label">Max score:</div>
          <input value={this.state.maxScore} onChange={this.handleMaxScoreChanged.bind(this)} />
        </div>

        <div className="text-input-group">
          <div className="text-input-label">Team A:</div>
          <input value={this.state.teamA} onChange={this.handleTeamAChanged.bind(this)} />
        </div>

        <div className="text-input-group">
          <div className="text-input-label">Team B:</div>
          <input value={this.state.teamB} onChange={this.handleTeamBChanged.bind(this)} />
        </div>

        <div className="btn create-new-game-btn" onClick={this.handleCreateNewGame.bind(this)}>
          Create new game
        </div>
      </div>
    )
  }

}

export default NewGame
