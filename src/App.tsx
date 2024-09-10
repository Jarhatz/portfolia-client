import { useState } from "react";
import "./App.css";
import ChatBar from "./Chatbar";

function App() {
  return (
    <div className="app-container">
      <div className="chat-window">
        <p className="title-text">Test</p>
        {/* <p className="title-text">Test</p>
        <p className="title-text">Test</p>
        <p className="title-text">Test</p>
        <p className="title-text">Test</p>
        <p className="title-text">Test</p>
        <p className="title-text">Test</p>
        <p className="title-text">Test</p>
        <p className="title-text">Test</p>
        <p className="title-text">Test</p>
        <p className="title-text">Test</p>
        <p className="title-text">Test</p>
        <p className="title-text">Test</p>
        <p className="title-text">Test</p>
        <p className="title-text">Test</p>
        <p className="title-text">Test</p>
        <p className="title-text">Test</p>
        <p className="title-text">Test</p>
        <p className="title-text">Test</p> */}
      </div>
      <div className="chatbar-container">
        <ChatBar />
      </div>
    </div>
  );
}

export default App;
