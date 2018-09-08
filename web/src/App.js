import socketWeb3 from './eth/socketWeb3'
import web3 from './eth/web3'
import React, { Component } from 'react'
import {
  Route,
  NavLink,
  HashRouter
} from 'react-router-dom'
import Games from './Views/Games'
import NewGame from './Views/NewGame'

class App extends Component {

  constructor(props) {
    super(props)
    this.state = {
      account: ''
    }
  }

  componentWillMount () {
    const $this = this

    socketWeb3.eth.subscribe('newBlockHeaders', function(error, result) {
      if (!error) {
        console.log('new block header: ', result)
      } else {
        console.error(error)
      }
    })

    web3.eth.getAccounts((error, accounts) => {
      if (!error) {
        $this.setState({ account: accounts[0] })

        // someContract.watchEvent(
        //   'SomeEvent',
        //   null,
        //   (event) => {
        //     this.doSomethingWithEvent()
        //   },
        //   console.error
        // )

      } else {
        console.error(error)
      }
    })

  }

  render() {
    return (
      <HashRouter>
        <div>
          <div className="main-header">
            <h1>[[-- Crowd Pong --]]</h1>
            <div>account[0]: {this.state.account}</div>
          </div>
          <div className="main-content">
            <div>
              <Route exact path="/" component={Games}/>
              <Route exact path="/new-game" component={NewGame}/>
            </div>
          </div>
        </div>
      </HashRouter>
    )
  }
}

export default App
