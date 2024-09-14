import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { MdSend } from "react-icons/md";

import "./Chat.css";
import Cursor from "./assets/cursor.svg";
import useTypingEffect from "./hooks/useTypingEffect";
import Thumbnail from "./components/Thumbnail";

interface Message {
  sender: "user" | "assistant";
  message: string;
  links: LinkPreview[];
  symbol?: string;
  action?: string;
  forecast?: Forecast;
}

interface Forecast {
  adjClose: number[];
  close: number[];
  date: string[];
  high: number[];
  low: number[];
  open: number[];
  volume: number[];
}

interface LinkPreview {
  url: string;
  siteName: string | null | undefined;
  image: string | null | undefined;
  title: string | null | undefined;
  description: string | null | undefined;
}

const ChatComponent = () => {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentModelMessage, setCurrentModelMessage] = useState<Message>({
    sender: "assistant",
    message:
      "Hello, I am Stocker, your personalized AI assistant. Feel free to ask me anything in the realm of financial modeling, stock prices, investment management, or just general monetary advice. I will do my best to help!",
    links: [],
  });
  const { text: modelMessage, isTyping } = useTypingEffect(
    currentModelMessage.message
  );
  const [featuredLinks, setFeaturedLinks] = useState<LinkPreview[]>([]);

  const endOfMessagesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (endOfMessagesRef.current) {
      endOfMessagesRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [modelMessage]);

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
      const { message, links, symbol, action, forecast } = response.data;
      console.log(forecast);

      if (
        forecast &&
        typeof forecast !== "string" &&
        typeof forecast !== "number"
      ) {
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
          message: message,
          links: links,
          symbol: symbol,
          action: action,
          forecast: predictions,
        };
        return assistantMessage;
      } else {
        console.log("Forecast not provided");
        const assistantMessage: Message = {
          sender: "assistant",
          message: message,
          links: links,
          symbol: symbol,
          action: action,
        };
        return assistantMessage;
      }
    } catch (error) {
      console.error("Link Preview Error Response: ", error);
      const assistantMessage: Message = {
        sender: "assistant",
        message:
          "I am sorry, I am having trouble with connecting with my back-end. Please check your network connectivity and try again.",
        links: [],
      };
      return assistantMessage;
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (input.trim()) {
      setMessages((prevMessages) => [...prevMessages, currentModelMessage]);
      setCurrentModelMessage({
        sender: "assistant",
        message: "Give me a moment...", // Possibly add chain-of-thought messages
        links: [],
      });

      const question = input.trim();
      setInput("");

      const userMessage: Message = {
        sender: "user",
        message: question,
        links: [],
      };
      setMessages((prevMessages) => [...prevMessages, userMessage]);

      const assistantMessage = await sendQuestion(question);
      setCurrentModelMessage(assistantMessage);
      if (assistantMessage.links.length > 0) {
        setFeaturedLinks(assistantMessage.links);
      }
    }
  }

  return (
    <div className="chat-container">
      <div className="chat-sidebar">
        <div className="logo-container">
          <img src="stockformer_logo.png" />
          <p className="logo-text">STOCKER</p>
        </div>
        <p className="system-text">
          {featuredLinks.length > 0 ? "——— RELEVANT ARTICLES ———" : ""}
        </p>
        {featuredLinks.map((link, l_idx) => (
          <div key={l_idx} className="link-container">
            <a href={link.url} target="_blank" rel="noopener noreferrer">
              {link.image ? (
                <Thumbnail
                  src={link.image}
                  defaultSrc="default_thumbnail.png"
                />
              ) : (
                <img src="default_thumbnail.png" />
              )}
              {link.siteName ? (
                <p className="sitename-text">{link.siteName}</p>
              ) : (
                <p className="sitename-text">Site</p>
              )}
              {link.title ? <p>{link.title}</p> : <p>Title</p>}
              {link.description ? (
                <p className="system-text">{link.description}</p>
              ) : (
                <p className="system-text">Description...</p>
              )}
            </a>
          </div>
        ))}
      </div>
      <div className="chat-main">
        <div className="chat-window">
          {messages.map((msg, m_idx) =>
            msg.sender === "user" ? (
              <div key={m_idx * 10} className="user-message">
                <p className="chat-text">{msg.message}</p>
              </div>
            ) : (
              <div key={m_idx * 10} className="assistant-message-container">
                <div className="profile-pic">
                  <img src="stockformer_logo.png" />
                  <p className="system-text">Stocker</p>
                </div>
                <div className="assistant-message">
                  {msg.message}
                  <br />
                  {msg.symbol}
                  <br />
                  {msg.action}
                  <br />
                  {msg.forecast ? "PREDICTION" : "NO PREDICTION"}
                </div>
              </div>
            )
          )}
          <div className="assistant-message-container">
            <div className="profile-pic">
              <img src="stockformer_logo.png" />
              <p className="system-text">Stocker</p>
            </div>
            <div className="assistant-message">
              {modelMessage}
              {isTyping && (
                <img
                  src={Cursor}
                  alt="cursor"
                  className="inline-block w-[0.75rem] animate-flicker"
                />
              )}
              {!isTyping ? (
                <p>
                  {currentModelMessage.symbol}
                  <br />
                  {currentModelMessage.action}
                  <br />
                  {currentModelMessage.forecast
                    ? "PREDICTION"
                    : "NO PREDICTION"}
                </p>
              ) : (
                <></>
              )}
            </div>
          </div>
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
    </div>
  );
};

export default ChatComponent;
