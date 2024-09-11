import React, { useState } from "react";
import axios from "axios";
import { MdSend } from "react-icons/md";
import "./Chat.css";

const Chat = () => {
  const [input, setInput] = useState("");
  const [message, setMessage] = useState("");
  const [symbol, setSymbol] = useState("");
  const [action, setAction] = useState("");
  const [forecast, setForecast] = useState(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (input.trim()) {
      const question = input;
      try {
        setInput("");
        setMessage("");
        setSymbol("");
        setAction("");
        setForecast(null);
        console.log(question);
        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_API_URL}/chat`,
          {
            params: {
              question: question,
            },
          }
        );
        console.log(response.data)
        const { message, symbol, action, forecast } = response.data;
        setMessage(message);

        if (symbol !== "None" && action !== "None") {
          setSymbol(symbol);
          setAction(action);
        }

        if (typeof forecast !== "string") {
          setForecast(forecast);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    }
  }

  return (
    <>
      <div className="chat-window">
        <p className="chat-text">{message} {symbol} {action}</p>
      </div>
      <div className="chatbar-container">
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
            <MdSend color="black" />
          </button>
        </form>
      </div>
    </>
  );
};

export default Chat;
