'use client'

import React, { useEffect, useState } from "react";
import "./WordsList.css"

const WordsList = () => {
  const [words, setWords] = useState([]);
  const [newWord, setNewWord] = useState("");
  const [editingWordId, setEditingWordId] = useState(null);
  const [editingWordValue, setEditingWordValue] = useState("");

  const fetchWords = async () => {
    try {
      const res = await fetch("https://localhost:3001/words", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch words");

      const data = await res.json();
      setWords(data);
    } catch (error) {
      console.error("Error fetching words:", error);
    }
  };

  useEffect(() => {
    fetchWords();
  }, []);

  const handleAddWord = async (e) => {
    e.preventDefault();
    if (newWord.length !== 5) {
      alert("Słowo musi mieć dokładnie 5 liter.");
      return;
  }
    try {
      const res = await fetch("https://localhost:3001/words", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ word: newWord }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        alert(errorData.error);
        return;
      }

      const addedWord = await res.json();
      setWords([...words, addedWord]);
      setNewWord("");
    } catch (error) {
      console.error("Error adding word:", error);
    }
  };

  const handleDeleteWord = async (id) => {
    try {
      const res = await fetch(`https://localhost:3001/words/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (res.ok) {
        setWords(words.filter((word) => word.id !== id));
      } else {
        console.error("Failed to delete word");
      }
    } catch (error) {
      console.error("Error deleting word:", error);
    }
  };

  const handleUpdateWord = async (id) => {
    if (editingWordValue.length !== 5) {
      alert("Słowo musi mieć dokładnie 5 liter.");
      return;
  }
    try {
      const res = await fetch(`https://localhost:3001/words/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ word: editingWordValue }),
      });

      if (res.ok) {
        const updatedWord = await res.json();
        setWords(words.map((word) => (word.id === id ? updatedWord : word)));
        setEditingWordId(null);
        setEditingWordValue("");
      } else {
        console.error("Failed to update word");
      }
    } catch (error) {
      console.error("Error updating word:", error);
    }
  };

  return (
    <div className="words-container">
      <h1 className="words-title">Manage Words</h1>
      
      <form onSubmit={handleAddWord} className="add-word-form">
        <input
          type="text"
          value={newWord}
          onChange={(e) => setNewWord(e.target.value.toUpperCase())}
          placeholder="Enter a new word"
          maxLength="10"
          required
          className="word-input"
        />
        <button type="submit" className="add-word-btn">Add Word</button>
        <a href="/">
            <button type="button" className="add-word-btn">Home</button>
        </a>
      </form>

      <ul className="words-list">
        {words.length > 0 ? (
          words.map((word) => (
            <li key={word.id} className="word-item">
              {editingWordId === word.id ? (
                <>
                  <input
                    type="text"
                    value={editingWordValue}
                    onChange={(e) => setEditingWordValue(e.target.value.toUpperCase())}
                    maxLength="10"
                    className="edit-word-input"
                  />
                  <button onClick={() => handleUpdateWord(word.id)} className="save-btn">Save</button>
                  <button onClick={() => setEditingWordId(null)} className="cancel-btn">Cancel</button>
                </>
              ) : (
                <>
                  <span className="word-text">{word.word}</span>
                  <button onClick={() => { setEditingWordId(word.id); setEditingWordValue(word.word); }} className="edit-btn">Edit</button>
                  <button onClick={() => handleDeleteWord(word.id)} className="delete-btn">Delete</button>
                </>
              )}
            </li>
          ))
        ) : (
          <p className="no-words-text">No words found</p>
        )}
      </ul>
    </div>
  );
};

export default WordsList;
