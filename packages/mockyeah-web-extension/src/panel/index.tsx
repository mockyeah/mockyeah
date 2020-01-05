import React from "react";
import ReactDOM from "react-dom";
import Modal from "react-modal";
import { App } from "./App";
// import { createConsole, whyRender } from './dev'
import "bootstrap/dist/css/bootstrap.min.css";
import "react-tabs/style/react-tabs.css";
import "./index.css";

console.log("panel");

document.body.style.background = "white";

const appElement = document.getElementById("app") as HTMLElement;

Modal.setAppElement(appElement);

const onReady = () => {
  ReactDOM.render(<App />, appElement);
};

if (process.env.NODE_ENV !== "production") {
  // createConsole(appElement);
  // whyRender();

  onReady();
} else {
  onReady();
}
