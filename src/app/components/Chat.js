'use client'

import { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import './Chat.css';

const API_URL = "http://localhost:3001";

async function fetchUser() {
  try {
    const response = await fetch(`${API_URL}/current-user`, {
      credentials: "include",
    });
    if (response.ok) return await response.json();
  } catch (error) {
    console.error("Błąd pobierania użytkownika:", error);
  }
  return null;
}

export default function Chat() {
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [socket, setSocket] = useState(null);
  const chatEndRef = useRef(null);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chat]);

  useEffect(() => {
    fetchUser().then((userData) => {
      if (userData) {
        setUser(userData);

        const newSocket = io("http://localhost:3002", {
          query: { username: userData.username },
        });

        setSocket(newSocket);

        newSocket.on("chatHistory", (history) => setChat(history));
        newSocket.on("receiveMessage", (data) => setChat((prevChat) => [...prevChat, data]));
        newSocket.on("updateUsers", (usersList) => setUsers(usersList));

        return () => {
          newSocket.disconnect();
        };
      }
    });
  }, []);

  const sendMessage = () => {
    if (message.trim() && socket) {
      socket.emit("sendMessage", { text: message, username: user.username }); 
      setMessage("");
    }
  };
  

  if (!user) {
    return <p>User loading...</p>;
  }

  return (
    <div className="chat-container">
      <div className="active-users">
        <h3>Active users:</h3>
        <ul>
          {users.map((username, i) => (
            <li key={i}>{username}</li>
          ))}
        </ul>
      </div>
      <div>
        <h2 className="chat-header">Online chat</h2>
        <div className="chat-messages">
          {chat.map((msg, i) => (
            <p key={i}>
              <strong>{msg.username}:</strong> {msg.text}
            </p>
          ))}
          <div ref={chatEndRef} />
        </div>
        <div className="chat-input-container">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Message..."
          />
          <button onClick={sendMessage}>Send</button>
        </div>
      </div>
    </div>
  );
  }