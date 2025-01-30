'use client'

import { useState, useEffect } from "react";
import { io } from "socket.io-client";

const socket = io("http://localhost:3002");
const API_URL = "http://localhost:3001";

export default function Chat() {
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch(`${API_URL}/current-user`, {
          credentials: "include",
        });

        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    };

    fetchUser();
  }, []);

  useEffect(() => {
    socket.on("chatHistory", (history) => {
      setChat(history);
    });

    socket.on("receiveMessage", (data) => {
      setChat((prevChat) => [...prevChat, data]);
    });

    return () => {
      socket.off("chatHistory");
      socket.off("receiveMessage");
    };
  }, []);

  const sendMessage = () => {
    if (message.trim() && user) {
      const chatMessage = { username: user.username, text: message };
      socket.emit("sendMessage", chatMessage);
      setMessage("");
    }
  };

  if (!user) {
    return <p>User loading...</p>;
  }

  return (
    <div>
      <h2>Online chat</h2>
      <div>
        {chat.map((msg, i) => (
          <p key={i}>
            <strong>{msg.username}:</strong> {msg.text}
          </p>
        ))}
      </div>
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Message..."
      />
      <button onClick={sendMessage}> Send </button>
    </div>
  );
}
