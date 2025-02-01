"use client";
import React, { useEffect, useState } from "react";

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

  return (
    <div>
      <h1>Notes</h1>

      <form onSubmit={handleAddNote}>
        <input 
          type="text" 
          value={newNote} 
          onChange={(e) => setNewNote(e.target.value)} 
          placeholder="Write a note..." 
        />
        <button type="submit">Add Note</button>
      </form>

      <ul>
        {notes.length > 0 ? (
          notes.map((note) => (
            <li key={note.id}>
              {editingNoteId === note.id ? (
                <>
                  <textarea
                    value={editingNoteContent}
                    onChange={(e) => setEditingNoteContent(e.target.value)}
                  />
                  <button onClick={() => handleUpdateNote(note.id)}>Save</button>
                  <button onClick={() => setEditingNoteId(null)}>Cancel</button>
                </>
              ) : (
                <>
                  {note.content}
                  <button onClick={() => { setEditingNoteId(note.id); setEditingNoteContent(note.content); }}>Edit</button>
                  <button onClick={() => handleDeleteNote(note.id)}>Delete</button>
                </>
              )}
            </li>
          ))
        ) : (
          <p>No notes found</p>
        )}
      </ul>
    </div>
  );
};

export default NotesList;
