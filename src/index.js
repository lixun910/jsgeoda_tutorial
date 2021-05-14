import { StrictMode } from "react";
import ReactDOM from "react-dom";
// import jsgeoda library
import jsgeoda from "jsgeoda";
import App from "./App";

const rootElement = document.getElementById("root");

// jsgeoda.New() function will create an instance from WASM
// object that you can used later for spatial data analysis
jsgeoda.New().then((geoda) => {
  ReactDOM.render(
    <StrictMode>
      <App version={geoda.version} />
    </StrictMode>,
    rootElement
  );
});
