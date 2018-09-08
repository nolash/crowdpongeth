import React, { Component } from 'react'

class GameList extends Component {

  constructor(props) {
    super(props)
  }

  renderGame (game, i) {
    return (
      <div className="game-list-item" key={`game-list-item_${i}`}>
        <div className="team-num">#{i + 1}</div>
        <div className="team-info">
          <div className="team-name">{game.teamA}</div>
          <div className="team-vs">vs.</div>
          <div className="team-name">{game.teamB}</div>
        </div>
        <div className="btn team-join-btn">Join</div>
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
