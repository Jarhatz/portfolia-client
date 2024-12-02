import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { MdSend } from "react-icons/md";
import { FcBullish, FcBearish } from "react-icons/fc";
import { GiHalt } from "react-icons/gi";

import Cursor from "./assets/cursor.svg";
import ForecastPlot from "./components/ForecastPlot";
import Thumbnail from "./components/Thumbnail";
import "./Chat.css";

interface Message {
  sender: string;
  message: string;
  links: LinkPreview[];
  symbol?: string;
  action?: string;
  forecast?: Forecast;
  options?: { [key: string]: string };  // To handle quiz options
}

interface Forecast {
  dates: string[];
  opens: number[];
  closes: number[];
  highs: number[];
  lows: number[];
  adjCloses: number[];
  volumes: number[];
  numDays: number;
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
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentModelMessage, setCurrentModelMessage] = useState<Message>({
    sender: "assistant",
    message:
      "Hello, I am Stocker, your personalized AI assistant. Feel free to ask me anything in the realm of financial modeling, stock prices, investment management, or just general monetary advice. I will do my best to help!\n\nIf you'd like to retake the investor personality quiz, just type 'retake quiz'.",
    links: [],
  });
  const [featuredLinks, setFeaturedLinks] = useState<LinkPreview[]>([]);

  // Typing animation hook
  const [forceGenerate, setForceGenerate] = useState(false);
  const [modelGenerate, setModelGenerate] = useState("");
  const [isTyping, setIsTyping] = useState(true);

  useEffect(() => {
    if (isTyping) {
      setModelGenerate(""); // Start with an empty string
      let i = 1; // Start from 1
      const intervalId = setInterval(() => {
        if (i <= currentModelMessage.message.length) {
          setModelGenerate(currentModelMessage.message.substring(0, i));
          i++;
        } else {
          clearInterval(intervalId);
          setTimeout(() => {
            setIsTyping(false);
          }, 500);
        }
      }, 15);
  
      return () => {
        clearInterval(intervalId);
      };
    }
  }, [currentModelMessage.message, forceGenerate, isTyping]);

  // Add assistant message to messages after typing completes
  useEffect(() => {
    if (!isTyping && currentModelMessage.message !== "") {
      setMessages((prevMessages) => [...prevMessages, currentModelMessage]);
    }
  }, [isTyping, currentModelMessage]);

  // Auto-scroll listener hook
  const endOfMessagesRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (endOfMessagesRef.current) {
      setTimeout(
        () => endOfMessagesRef.current?.scrollIntoView({ behavior: "smooth" }),
        250
      );
    }
  }, [modelGenerate, isLoading]);

  async function sendQuestion(question: string) {
    try {
      const instance = axios.create({
        timeout: 5000 * 60, // Set timeout to 5 minutes
        withCredentials: true, // Ensure cookies are sent with requests
      });
      const response = await instance.post(
        `${import.meta.env.VITE_BACKEND_API_URL}/chat`,
        {
          message: question,
        }
      );
      const data = response.data;
  
      let assistantMessage: Message;
  
      if (data.options) {
        // The server sent a quiz question
        assistantMessage = {
          sender: "assistant",
          message: data.message,
          links: [],
          options: data.options, // Include options in the message
        };
      } else {
        // Regular assistant response
        const { message, links, symbol, action, forecast } = data;
        console.log(forecast);
  
        let forecastData: Forecast | undefined = undefined;
  
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
  
          forecastData = {
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
            numDays: forecast["Num Days"],
          };
        } else {
          console.log("Forecast not provided");
        }
  
        assistantMessage = {
          sender: "assistant",
          message: message,
          links: links || [],
          symbol: symbol,
          action: action,
          forecast: forecastData,
        };
      }
  
      // Update currentModelMessage and other states
      setCurrentModelMessage(assistantMessage);
      setForceGenerate((prev) => !prev);
      if (assistantMessage.links.length > 0) {
        setFeaturedLinks(assistantMessage.links);
      }
      // Set isTyping to true before starting typing animation
      setIsTyping(true);

      setIsLoading(false);

      return assistantMessage;
    } catch (error) {
      console.error("API Error Response: ", error);
      const assistantMessage: Message = {
        sender: "assistant",
        message:
          "I am sorry, I am having trouble connecting with my back-end. Please check your network connectivity and try again.",
        links: [],
      };
  
      // Update currentModelMessage with error message
      setCurrentModelMessage(assistantMessage);
      setForceGenerate((prev) => !prev);
      setIsTyping(true);
      setIsLoading(false);

      return assistantMessage;
    }
  }
  
  function handleOptionSelect(option: string) {
    // Send the selected option back to the server as a message
    sendQuestion(option);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (input.trim() && !isTyping) {
      setIsLoading(true);
      const question = input.trim();
      setInput("");
  
      const userMessage: Message = {
        sender: "user",
        message: question,
        links: [],
      };
      setMessages((prevMessages) => [...prevMessages, userMessage]);
  
      // We don't need to assign assistantMessage here since sendQuestion handles it
      await sendQuestion(question);
    }
  }

  return (
    <div className="chat-container">
      <div className="chat-sidebar">
        <div className="logo-container">
          <img src="stockformer_logo.png" />
          <p className="logo-text">Portfolia</p>
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
                  {msg.options ? (
                    <div className="quiz-options">
                      {Object.entries(msg.options).map(([optionKey, optionText]) => (
                        <button
                          key={optionKey}
                          onClick={() => handleOptionSelect(optionKey)}
                          className="quiz-option-button"
                        >
                          {optionKey}) {optionText}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="fac">
                      {msg.forecast ? (
                        <ForecastPlot symbol={msg.symbol} forecast={msg.forecast} />
                      ) : null}
                      <div className="ac">
                        {msg.action && msg.action !== "None" && <p>Action:</p>}

                        {msg.action === "buy" && (
                          <div className="ac-content">
                            Buy
                            <FcBullish size={"1.5rem"} />
                          </div>
                        )}
                        {msg.action === "sell" && (
                          <div className="ac-content">
                            Sell
                            <FcBearish size={"1.5rem"} />
                          </div>
                        )}
                        {msg.action === "hold" && (
                          <div className="ac-content">
                            Hold
                            <GiHalt size={"1.5rem"} />
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )
          )}

          {/* Typing indicator */}
          {(isLoading || isTyping) && (
            <div className="assistant-message-container">
              <div className="profile-pic">
                <img src="stockformer_logo.png" />
                <p className="system-text">Stocker</p>
              </div>
              <div className="assistant-message">
                {isLoading ? (
                  <p className="system-text">Stocker is thinking...</p>
                ) : (
                  <>
                    {modelGenerate}
                    <img
                      src={Cursor}
                      alt="cursor"
                      className="inline-block w-[0.75rem] animate-flicker"
                    />
                  </>
                )}
              </div>
            </div>
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
