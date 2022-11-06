import React from "react";
import "./App.css";
import Sidebar from "./Sidebar";
import Chat from "./Chat";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import Login from "./Login";
import { useStateValue } from "./StateProvider";
import UseWindowDimensions from "./UseWindowDimensions";
import { Auth } from '@three0dev/js-sdk';

// work on messages position (put reciever messages on one side, 
// and sender messages in another)
// need to work on getting timestamps correctly formatted for dates
function App() {
  const [{ user }, dispatch] = useStateValue();
  const { width } = UseWindowDimensions();
  const uid =
    localStorage.getItem("uid") !== undefined
      ? localStorage.getItem("uid")
      : null;

  
  return (
    <div className="app">
      {Auth.isLoggedIn() == false ? (
        <Login/>
      ) : (
        <div className="app__body">
          <Router>
            <Sidebar/>
            <Switch>
              <Route path="/rooms/:roomId">
                <Chat/>
              </Route>
              <Route path="/">
                <Chat/>
              </Route>
            </Switch>
          </Router>
        </div>
      )}
    </div>
  );
}

export default App;
