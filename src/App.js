import React, {useEffect} from 'react';
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
  useEffect(() => {
    return () => socket.emit('disconnect')
  }, [])


  // if (locatio)

  if (socket) {
    return (
      <Router>
        <div className="nb-wrapper">
          <Link to='/' className="nb-container">
            <SingleHex fillColor='0xff3333' borderColor='0xf52929' size={pixiSizeScalar(30)} />
            <h1>Hexago</h1>
          </Link>
        </div>
        <div>
          <Switch>
            <Route exact path="/">
              <div className='page-content'>
                <Home />
              </div>
            </Route>
            <Route exact path="/rules">
              <div className='page-content'>
                <Rules />
              </div>
            </Route>
            <Route path="/play/:id" render={({match}) => {
              return <Play id={match.params.id} />
            }} />
            <Route path="/play">
              <Play />
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