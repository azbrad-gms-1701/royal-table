import React from "react";
import ReactDOM from "react-dom/client";
import { ThemeProvider } from "./context/ThemeContext";
import { PlayersProvider } from "./context/PlayersContext";
import App from "./App.jsx";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ThemeProvider>
      <PlayersProvider>
        <App />
      </PlayersProvider>
    </ThemeProvider>
  </React.StrictMode>
);