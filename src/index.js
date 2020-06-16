import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import * as serviceWorker from "./serviceWorker";

ReactDOM.render(<App />, document.getElementById("root"));

if (process.env.REACT_APP_OFFLINE_FIRST !== undefined) {
  console.log("starting application with offline first support");
  serviceWorker.register();
} else {
  console.log("starting application without offline first support");
  serviceWorker.unregister();
}
