import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { MdSend } from "react-icons/md";

import "./Chat.css";
import Cursor from "./assets/cursor.svg";
import useTypingEffect from "./hooks/useTypingEffect";
import LineChart from "./components/LineChart";
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
  dates: string[];
  opens: number[];
  closes: number[];
  highs: number[];
  lows: number[];
  adjCloses: number[];
  volumes: number[];
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
  const [loading, setLoading] = useState(false);
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
        // Function to convert date to YYYY-MM-DD format
        const formatDate = (dateString: string): string => {
          const date = new Date(dateString);
          return date.toISOString().split("T")[0];
        };
        const dates = Object.values(forecast["Date"]).map((value) =>
          String(value)
        );
        dates.forEach((value: string, index: number) => {
          dates[index] = formatDate(value);
        });

        const predictions: Forecast = {
          dates: dates,
          opens: Object.values(forecast["Open"]).map((value) => Number(value)),
          closes: Object.values(forecast["Close"]).map((value) =>
            Number(value)
          ),
          highs: Object.values(forecast["High"]).map((value) => Number(value)),
          lows: Object.values(forecast["Low"]).map((value) => Number(value)),
          adjCloses: Object.values(forecast["Adj Close"]).map((value) =>
            Number(value)
          ),
          volumes: Object.values(forecast["Volume"]).map((value) =>
            Number(value)
          ),
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
      console.error("API Error Response: ", error);
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
      setLoading(true);

      const question = input.trim();
      setInput("");

      const userMessage: Message = {
        sender: "user",
        message: question,
        links: [],
      };
      setMessages((prevMessages) => [...prevMessages, userMessage]);

      const assistantMessage = await sendQuestion(question);
      setLoading(false);
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
          <p className="logo-text">Stocker</p>
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
                  {msg.symbol && msg.symbol !== "None" ? (
                    <p>{msg.symbol}</p>
                  ) : (
                    <></>
                  )}
                  {msg.action && msg.action !== "None" ? (
                    <p>{msg.action}</p>
                  ) : (
                    <></>
                  )}
                  {msg.forecast ? <LineChart forecast={msg.forecast} /> : <></>}
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
              {loading ? (
                "Give me a moment..."
              ) : (
                <>
                  {modelMessage}
                  {isTyping && (
                    <img
                      src={Cursor}
                      alt="cursor"
                      className="inline-block w-[0.75rem] animate-flicker"
                    />
                  )}
                  {!isTyping ? (
                    <>
                      {currentModelMessage.symbol &&
                      currentModelMessage.symbol !== "None" ? (
                        <p>{currentModelMessage.symbol}</p>
                      ) : (
                        <></>
                      )}
                      {currentModelMessage.action &&
                      currentModelMessage.action !== "None" ? (
                        <p>{currentModelMessage.action}</p>
                      ) : (
                        <></>
                      )}
                      {currentModelMessage.forecast ? (
                        <LineChart forecast={currentModelMessage.forecast} />
                      ) : (
                        <></>
                      )}
                    </>
                  ) : (
                    <></>
                  )}
                </>
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
