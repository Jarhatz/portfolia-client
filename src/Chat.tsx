import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import Typewriter from "typewriter-effect";
import { MdSend } from "react-icons/md";
import "./Chat.css";
import { scroller } from "react-scroll";

interface Forecast {
  temp: string;
}

interface Message {
  sender: "user" | "assistant";
  message: string;
  symbol?: string;
  action?: string;
  forecast?: Forecast;
  urls?: string[];
}

const Chat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");

  const endOfMessagesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (endOfMessagesRef.current) {
      endOfMessagesRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  async function sendQuestion(question: string) {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_API_URL}/chat`,
        {
          params: {
            question: question,
          },
        }
      );
      const { message, symbol, action, forecast, urls } = response.data;
      console.log(forecast);
      if (typeof forecast === "string") {
        console.log("Forecast is a string");
      } else {
        console.log(typeof forecast);
      }
      const assistantMessage: Message = {
        sender: "assistant",
        message: message,
        symbol: symbol,
        action: action,
        urls: urls,
      };
      return assistantMessage;
    } catch (error) {
      console.error("Error Response: ", error);
      const assistantMessage: Message = {
        sender: "assistant",
        message:
          "I am sorry, I am having trouble with connecting to the internet. Please try again.",
        symbol: "None",
        action: "None",
      };
      return assistantMessage;
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (input.trim()) {
      const question = input
      setInput("")

      const userMessage: Message = { sender: "user", message: question };
      setMessages((prevMessages) => [
        ...prevMessages,
        userMessage,
      ]);

      const assistantMessage = await sendQuestion(question)
      setMessages((prevMessages) => [
        ...prevMessages,
        assistantMessage,
      ]);
    }
  }

  return (
    <div className="chat-container">
      <div className="chat-window">
        {messages.map((msg, index) =>
          msg.sender === "user" ? (
            <div key={index} className="user-message">
              <p className="chat-text">{msg.message}</p>
            </div>
          ) : (
            <div key={index} className="assistant-message">
              <p className="chat-text">
                <Typewriter
                  options={{
                    strings: msg.message,
                    cursor: "",
                    autoStart: true,
                    loop: false,
                    delay: 10,
                  }}
                />
                <br />
                {msg.symbol}
                <br />
                {msg.action}
                <br />
                {msg.urls}
              </p>
            </div>
          )
        )}
        <div ref={endOfMessagesRef} />
      </div>
      <div className="chatbar-container">
        <form onSubmit={handleSubmit} className="chat-bar-form">
          <textarea
            className="chat-bar-input"
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                const form = e.currentTarget.form;
                if (form) {
                  form.requestSubmit();
                }
              }
            }}
            placeholder="Ask a question..."
            rows={1}
          />
          <button type="submit" className="chat-bar-send-btn">
            <MdSend color="white" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default Chat;
