import React from 'react';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import Home from './components/Home';
import Game from './components/Game';
import openSocket from 'socket.io-client';
const socket = openSocket('http://localhost:5000');

function App() {
  return (
    <div className="App">
      <Router>
        <Route path="/" exact component={() => <Home socket={socket} />} />
        <Route path='/game/:nickname/:code' exact component={(props) => <Game {...props} socket={socket} />} />
      </Router>
    </div>
  );
}

export default App;
