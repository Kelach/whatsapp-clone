import React from "react";
import { render } from "react-dom";
import "./index.css";
import App from "./App";
import * as serviceWorker from "./serviceWorker";
import reducer, { initialState } from "./reducer";
import { StateProvider } from "./StateProvider";

import { init } from '@three0dev/js-sdk';
import './App.css'
import { env } from './env';



init(env.three0Config).then(() => {
  render(
    <StateProvider initialState={initialState} reducer={reducer}>
      <App />
    </StateProvider>,
    document.getElementById("root")
  );   
}).catch(console.error)





// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
