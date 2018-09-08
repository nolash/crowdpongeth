import React, { Component } from 'react'
import {
  NavLink
} from 'react-router-dom'

class Games extends Component {

  constructor(props) {
    super(props)
    this.state = {}
  }

  componentWillMount () {

  }

  render () {
    return (
      <div>
        <NavLink to="/new-game" className="btn">New Game</NavLink>
        <div>...</div>
        <div>Games:</div>
      </div>
    )
  }

}

export default Games
