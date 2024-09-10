import React, { useState } from "react";
import { MdSend } from "react-icons/md";
import "./Chatbar.css";

const ChatBar = () => {
  const [input, setInput] = useState("");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (input.trim()) {
      console.log(input);
      setInput("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="chat-bar-form">
      <textarea
        className="chat-bar-input"
        value={input}
        onChange={(e) => {
          setInput(e.target.value);
        }}
        placeholder="Ask a question..."
        rows={1}
      />
      <button type="submit" className="chat-bar-send-btn">
        <MdSend color="black"/>
      </button>
    </form>
  );
};

export default ChatBar;
