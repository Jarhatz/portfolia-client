import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import Typewriter from "typewriter-effect";
import { MdSend } from "react-icons/md";
import "./Chat.css";
import { getLinkPreview } from "link-preview-js";
// import { scroller } from "react-scroll";

interface Message {
  sender: "user" | "assistant";
  message: string;
  symbol?: string;
  links: LinkPreview[];
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
  title: string | undefined;
  image: string | undefined;
  siteName: string | undefined;
  description: string | undefined;
}

const ChatComponent = () => {
  const defaultMessage: Message = {
    sender: "assistant",
    message:
      "Hello, I am Stocker, your personalized AI assistant. Feel free to ask me anything in the realm of financial modeling, stock prices, investment management, or just general monetary advice. I will do my best to help!",
    links: [],
  };

  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([defaultMessage]);
  const [featuredLinks, setFeaturedLinks] = useState<LinkPreview[]>([]);

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

      const links: LinkPreview[] = [];
      for (const url of urls) {
        try {
          const data: any = await getLinkPreview(url, {headers: {'user-agent': 'googlebot', 'Accept-Language': 'en-US'}});
          var link_thumbnail: string | undefined = undefined;
          if (data.images.length > 0) {
            link_thumbnail = data.images[0];
          }
          const link: LinkPreview = {
            url: url,
            title: data.title,
            siteName: data.siteName,
            description: data.description,
            image: link_thumbnail,
          };
          links.push(link);
        } catch (error) {
          const link: LinkPreview = {
            url: url,
            title: undefined,
            siteName: undefined,
            description: undefined,
            image: undefined,
          };
          links.push(link);
        }
      }

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
          message: message.replace(/\n/g, "<br />"),
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
      const question = input.trim();
      setInput("");

      const userMessage: Message = {
        sender: "user",
        message: question,
        links: [],
      };
      setMessages((prevMessages) => [...prevMessages, userMessage]);

      const assistantMessage = await sendQuestion(question);
      setMessages((prevMessages) => [...prevMessages, assistantMessage]);
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
              <div className="thumbnail-container">
                {link.siteName ? (
                  <p className="sitename-text">{link.siteName}</p>
                ) : (
                  <p className="sitename-text">Site</p>
                )}
                {link.image ? <img src={link.image} /> : <></>}
              </div>
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
                  <Typewriter
                    options={{
                      strings: msg.message,
                      cursor: "",
                      autoStart: true,
                      loop: false,
                      delay: 10,
                    }}
                  />
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
