import React, { Component } from 'react'
import { NavLink } from 'react-router-dom'

class GameList extends Component {

  constructor(props) {
    super(props)
  }

  renderGame (game, i) {
    return (
      <div className="game-list-item" key={`game-list-item_${i}`}>
        <div className="team-num">#{i}</div>
        <div className="team-info">
          <div className="team-name">{game.teamA}</div>
          <div className="team-vs">vs.</div>
          <div className="team-name">{game.teamB}</div>
        </div>
        <NavLink to={`/game/${game.index}`} className="lnk">View</NavLink>
      </div>
    )
  }

  render () {
    return (
      <div>
        {
          this.props.games.map((g, i) => {
            return this.renderGame(g, i)
          })
        }
      </div>
    )
  }

}

export default GameList
