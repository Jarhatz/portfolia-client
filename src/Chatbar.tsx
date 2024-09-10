import React, { useState } from "react";
import axios from "axios";
import { MdSend } from "react-icons/md";
import "./Chatbar.css";

const ChatBar = () => {
  const [input, setInput] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (input.trim()) {
      const question = input
      setInput("")
      console.log(question)
      try {
        const response = await axios.get("http://localhost:5000/chat", {
          params: {
            question: question,
          },
        });
        console.log(response.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    }
  }

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
