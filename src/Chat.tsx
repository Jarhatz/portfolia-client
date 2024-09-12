import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import Typewriter from "typewriter-effect";
import { MdSend } from "react-icons/md";
import "./Chat.css";
import { scroller } from "react-scroll";

interface Forecast {
  adjClose: number[];
  close: number[];
  date: string[];
  high: number[];
  low: number[];
  open: number[];
  volume: number[];
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
      if (typeof forecast !== "string") {
        console.log(forecast);
        const predictions: Forecast = {
          adjClose: Object.values(forecast["Adj Close"]),
          close: Object.values(forecast["Close"]),
          date: Object.values(forecast["Date"]),
          high: Object.values(forecast["High"]),
          low: Object.values(forecast["Low"]),
          open: Object.values(forecast["Open"]),
          volume: Object.values(forecast["Volume"]),
        };
        const assistantMessage: Message = {
          sender: "assistant",
          message: message.replace(/\n/g, "<br />"),
          symbol: symbol,
          action: action,
          forecast: predictions,
          urls: urls,
        };
        return assistantMessage;
      } else {
        console.log("no forecast provided");
        const assistantMessage: Message = {
          sender: "assistant",
          message: message.replace(/\n/g, "<br />"),
          symbol: symbol,
          action: action,
          urls: urls,
        };
        return assistantMessage;
      }
    } catch (error) {
      console.error("Error Response: ", error);
      const assistantMessage: Message = {
        sender: "assistant",
        message:
          "I am sorry, I am having trouble with connecting with my back-end. Please check your network connectivity and try again.",
      };
      return assistantMessage;
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (input.trim()) {
      const question = input;
      setInput("");

      const userMessage: Message = { sender: "user", message: question };
      setMessages((prevMessages) => [...prevMessages, userMessage]);

      const assistantMessage = await sendQuestion(question);
      setMessages((prevMessages) => [...prevMessages, assistantMessage]);
    }
  }

  return (
    <div className="chat-container">
      <div className="chat-window">
        {messages.map((msg, m_idx) =>
          msg.sender === "user" ? (
            <div key={m_idx * 10} className="user-message">
              <p className="chat-text">{msg.message}</p>
            </div>
          ) : (
            <div key={m_idx * 10} className="assistant-message-container">
              <div className="profile-pic-container">
                <img src="stockformer_logo.png" className="profile-pic" />
                <p className="system-text">Stocker</p>
              </div>
              <div className="assistant-message">
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
                <div className="url-stack">
                  {msg.urls && msg.urls.length > 0 ? (
                    msg.urls.map((url, u_idx) => (
                      <a
                        href={url}
                        key={m_idx * 10 + u_idx}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <br />
                        {url}
                        <br />
                      </a>
                    ))
                  ) : (
                    <></>
                  )}
                </div>
              </div>
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
