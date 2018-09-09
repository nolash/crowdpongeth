import React, { Component } from 'react'
import {
  NavLink
} from 'react-router-dom'
import Pong from '../web3Contracts/Pong'
import GameList from '../Components/GameList'

class Games extends Component {

  constructor(props) {
    super(props)
    this.state = {
      games: []
    }
  }

  componentWillMount () {
    this.fetchGames()
  }

  async fetchGames () {
    const $this = this

    let eventFilterConfig = {
      fromBlock: 0,
      toBlock: 'latest'
    }

    Pong.socket.getPastEvents('NewGame', eventFilterConfig, async (err, events) => {
      console.log(events);
      if (err) {
        $this.handleEventError(err)
      } else {
        Pong.socket.events['NewGame'](eventFilterConfig)
          .on('data', $this.handleNewGame.bind($this))
          .on('error', $this.handleEventErr.bind($this))
      }
    })
  }

  handleNewGame (data) {
    let games = this.state.games
    games.push(data.returnValues)
    this.setState({
      games
    })
  }

  handleEventErr (err) {
    console.error('EVENT ERR: ', err)
  }

  render () {

    // setInterval(function() {
    //   var kitties = document.getElementsByClassName('gifCat');
    //   if (kitties[1].style.display == 'none') {
    //     kitties[0].style.display = 'none';
    //     kitties[1].style.display = '';
    //   } else {
    //     kitties[1].style.display = 'none';
    //     kitties[0].style.display = '';
    //   }
    // }, 400);

    return (
      <div className="row">
        <div className="col-md-3"><img className="gifCat" src="https://media0.giphy.com/media/vcYJ10AVGFZbG/giphy.gif"/></div>
        <div className="col-md-6">
          <NavLink to="/new-game" className="btn">New Game</NavLink>
          <br /><br />
          <br /><br />
          <div>Games:</div>
          <br />
          <GameList games={this.state.games} />
        </div>
        <div className="col-md-3"><img className="gifCat" src="https://media0.giphy.com/media/vcYJ10AVGFZbG/giphy.gif"/></div>
      </div>
    )
  }

}

export default Games
