import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import Typewriter from "typewriter-effect";
import { MdSend } from "react-icons/md";
import "./Chat.css";
// import { scroller } from "react-scroll";

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

const ChatComponent = () => {
  const defaultMessage: Message = {
    sender: "assistant",
    message:
      "Hello, I am Stocker, your personalized AI assistant. Feel free to ask me anything in the realm of financial modeling, stock prices, investment management, or just general monetary advice. I will do my best to help!",
  };

  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([defaultMessage]);
  const [featuredLinks, setFeaturedLinks] = useState<string[]>([]);

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
          message: message.replace(/\n/g, "<br />"),
          symbol: symbol,
          action: action,
          forecast: predictions,
          urls: urls,
        };
        return assistantMessage;
      } else {
        console.log("Forecast not provided");
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
      const question = input.trim();
      setInput("");

      const userMessage: Message = { sender: "user", message: question };
      setMessages((prevMessages) => [...prevMessages, userMessage]);

      const assistantMessage = await sendQuestion(question);
      setMessages((prevMessages) => [...prevMessages, assistantMessage]);
      if (assistantMessage.urls && assistantMessage.urls.length > 0) {
        setFeaturedLinks(assistantMessage.urls);
      }
    }
  }

  return (
    <div className="chat-container">
      <div className="chat-side">
        {featuredLinks.map((link, u_idx) => (
          <p key={u_idx}>{link}</p>
        ))}
        {/* Firstly, considering the user's investor personality, it is clear that
        they prioritize building wealth and are willing to take calculated risks
        to achieve their goals. They also prefer to maintain control over their
        investments and are not averse to borrowing money to make money. This
        suggests that they may be open to investing in stocks with growth
        potential. Analyzing the retrieved documents, it is evident that the
        consensus among Wall Street analysts is that AAPL stock has a positive
        outlook. The average 12-month price target is around $240-$250, with a
        high estimate of $300 and a low estimate of $180. This represents a
        potential upside of 9-12% from the current price. Given this
        information, I predict that AAPL stock will continue to trend upwards
        over the next 72 days, driven by the company's strong financials and
        growth prospects. However, it's essential to note that the stock market
        can be volatile, and there may be fluctuations along the way. Firstly,
        considering the user's investor personality, it is clear that they
        prioritize building wealth and are willing to take calculated risks to
        achieve their goals. They also prefer to maintain control over their
        investments and are not averse to borrowing money to make money. This
        suggests that they may be open to investing in stocks with growth
        potential. Analyzing the retrieved documents, it is evident that the
        consensus among Wall Street analysts is that AAPL stock has a positive
        outlook. The average 12-month price target is around $240-$250, with a
        high estimate of $300 and a low estimate of $180. This represents a
        potential upside of 9-12% from the current price. Given this
        information, I predict that AAPL stock will continue to trend upwards
        over the next 72 days, driven by the company's strong financials and
        growth prospects. However, it's essential to note that the stock market
        can be volatile, and there may be fluctuations along the way. Firstly,
        considering the user's investor personality, it is clear that they
        prioritize building wealth and are willing to take calculated risks to
        achieve their goals. They also prefer to maintain control over their
        investments and are not averse to borrowing money to make money. This
        suggests that they may be open to investing in stocks with growth
        potential. Analyzing the retrieved documents, it is evident that the
        consensus among Wall Street analysts is that AAPL stock has a positive
        outlook. The average 12-month price target is around $240-$250, with a
        high estimate of $300 and a low estimate of $180. This represents a
        potential upside of 9-12% from the current price. Given this
        information, I predict that AAPL stock will continue to trend upwards
        over the next 72 days, driven by the company's strong financials and
        growth prospects. However, it's essential to note that the stock market
        can be volatile, and there may be fluctuations along the way. */}
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
                  {/* <div className="url-stack">
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
                  </div> */}
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
    </div>
  );
};

export default ChatComponent;
