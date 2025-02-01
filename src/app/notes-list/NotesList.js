"use client";
import React, { useEffect, useState } from "react";
import "./NotesList.css"

const NotesList = () => {
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState("");
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [editingNoteContent, setEditingNoteContent] = useState("");
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("http://localhost:3001/current-user", { credentials: "include" });
        if (!res.ok) throw new Error("Failed to fetch user");

        const data = await res.json();
        setUser(data);
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    };
    fetchUser();
  }, []);

  useEffect(() => {
    if (user) fetchNotes();
  }, [user]);

  const fetchNotes = async () => {
    try {
      const res = await fetch("http://localhost:3001/notes", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch notes");

      setNotes(await res.json());
    } catch (error) {
      console.error("Error fetching notes:", error);
    }
  };

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!newNote.trim()) return;

    try {
      const res = await fetch("http://localhost:3001/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ content: newNote }),
      });

      if (!res.ok) throw new Error("Failed to add note");

      setNotes([...notes, await res.json()]);
      setNewNote("");
    } catch (error) {
      console.error(error);
    }
  };

  const handleUpdateNote = async (noteId) => {
    try {
      const res = await fetch(`http://localhost:3001/notes/${noteId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ content: editingNoteContent }),
      });

      if (!res.ok) throw new Error("Failed to update note");

      setNotes(notes.map((note) => (note.id === noteId ? { ...note, content: editingNoteContent } : note)));
      setEditingNoteId(null);
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteNote = async (noteId) => {
    if (!window.confirm("Are you sure you want to delete this note?")) return;

    try {
      const res = await fetch(`http://localhost:3001/notes/${noteId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!res.ok) throw new Error("Failed to delete note");

      setNotes(notes.filter((note) => note.id !== noteId));
    } catch (error) {
      console.error(error);
    }
  };

  const handleTextAreaChange = (e) => {
    e.target.style.height = 'auto';
    e.target.style.height = `${e.target.scrollHeight}px`;
  };

  return (
    <div className="notes-container">
      <h1 className="notes-title">Notes</h1>

      <form className="notes-form" onSubmit={handleAddNote}>
        <input 
          className="note-input"
          type="text" 
          value={newNote} 
          onChange={(e) => setNewNote(e.target.value)} 
          placeholder="Write a note..." 
        />
        <button className="add-note-button" type="submit">Add Note</button>
      </form>

      <ul className="notes-list">
        {notes.length > 0 ? (
          notes.map((note) => (
            <li key={note.id} className="note-item">
              {editingNoteId === note.id ? (
                <>
                  <textarea
                    className="note-textarea"
                    value={editingNoteContent}
                    onChange={(e) => {
                      setEditingNoteContent(e.target.value);
                      handleTextAreaChange(e);
                    }}
                  />
                  <button className="save-button" onClick={() => handleUpdateNote(note.id)}>Save</button>
                  <button className="cancel-button" onClick={() => setEditingNoteId(null)}>Cancel</button>
                </>
              ) : (
                <>
                  <span className="note-content">{note.content}</span>
                  <button className="edit-button" onClick={() => { setEditingNoteId(note.id); setEditingNoteContent(note.content); }}>Edit</button>
                  <button className="delete-button" onClick={() => handleDeleteNote(note.id)}>Delete</button>
                </>
              )}
            </li>
          ))
        ) : (
          <p className="no-notes-message">No notes found</p>
        )}
      </ul>
      <div className="navigation-button">
        <a href="/" className="btn home-btn">Home</a>
      </div>
    </div>
  );
};

export default NotesList;
