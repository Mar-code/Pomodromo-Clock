import React from "react";
import ReactDOM from "react-dom";

import MyClock from "./App";

const rootElement = document.getElementById("root");
ReactDOM.render(
  <React.StrictMode>
    <MyClock />
  </React.StrictMode>,
  rootElement
);
