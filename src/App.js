import React, {useState, useEffect} from 'react';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link,
} from 'react-router-dom'
import socketIOClient from 'socket.io-client'
import CreateMap from './pages/CreateMap'
import Play from './pages/Play'
import CreateGame from './pages/CreateGame'
import Home from './pages/Home'
import Rules from './pages/Rules'
import Contact from './pages/Contact'
import JoinGame from './pages/JoinGame'
import './style/App.css'
import SingleHex from './components/SingleHex'

import {pixiSizeScalar} from './utils'
// let socket = socketIOClient('http://localhost:4000')
let socket = socketIOClient('https://gohexago.herokuapp.com/')

const App = () => {
  const [currentPlayers, setCurrentPlayers] = useState(0)

  useEffect(() => {
    return () => socket.emit('disconnect')
  }, [])



  if (socket) {
    socket.on('currentPlayers', (amt) => {
      setCurrentPlayers(amt)
    })
    return (
      <Router>
        <div className="nb-wrapper">
          {/* <a href='https://hexhiv.com/' className="nb-container"> */}
          {/* <a href='http://localhost:3000/' className="nb-container"> */}
          <Link to='/' className="nb-container">
            <SingleHex fillColor='0xff3333' borderColor='0xf52929' size={pixiSizeScalar(30)} />
            <h1>HexHiv</h1>
          </Link>
          {/* </a> */}
        </div>
        <div>
          <Switch>
            <Route exact path="/">
              <div className='testWrapper'>
                <a href='https://www.reddit.com/r/HexHiv/comments/j8qah8/50_100_player_tournament/' target='_blank' rel="noopener noreferrer" className='testWrapper'>
                  <h4 className="test">100 player </h4>
                  <h4 className="test">$50 prize pool</h4>
                  <h4 className="test">October 30th</h4>
                </a>
              </div>
              <div className='page-content'>
                <Home currentPlayers={currentPlayers} />
              </div>
            </Route>
            <Route exact path="/rules">
              <div className='page-content'>
                <Rules />
              </div>
            </Route>
            <Route path="/play/:id" render={({match}) => {
              return <Play id={match.params.id} currentPlayers={currentPlayers} />
            }} />
            <Route path="/play">
              <Play currentPlayers={currentPlayers} />
            </Route>
            <Route path="/create-game">
              <div className='page-content'>
                <CreateGame />
              </div>
            </Route>
            <Route path="/create-map">
              <div className='page-content'>
                <CreateMap />
              </div>
            </Route>
            <Route path="/join-game">
              <div className='page-content'>
                <JoinGame />
              </div>
            </Route>
            <Route exact path="/contact">
              <div className='page-content'>
                <Contact />
              </div>
            </Route>
          </Switch>
        </div>
      </Router>
    )
  } else {
    return (
      <h1>Loading..</h1>
    )
  }


}

export {App, socket};