'use client';
import React, { useState, useRef, useEffect } from 'react';
import './GameGrid.css';
import { io } from "socket.io-client";

const socket = io("wss://localhost:3002");
const API_URL = "https://localhost:3001";

export default function GameGrid() {
  const [validWords, setValidWords] = useState([]);
  const [secretWord, setSecretWord] = useState('');
  const [grid, setGrid] = useState(Array(30).fill(''));
  const [currentRow, setCurrentRow] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [guesses, setGuesses] = useState([]);
  const [leader, setLeader] = useState(null);
  const inputRefs = useRef([]);
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
    const fetchWords = async () => {
      try {
        const res = await fetch("https://localhost:3001/words", { credentials: "include" });
        if (!res.ok) throw new Error("Failed to fetch words");

        const data = await res.json();
        setValidWords(data.map(word => word.word));
      } catch (error) {
        console.error("Error fetching words:", error);
      }
    };

    fetchWords();
  }, []);

  useEffect(() => {
    const fetchSecretWord = async () => {
      try {
        const res = await fetch(`${API_URL}/secret-word`, { credentials: "include" });
        if (!res.ok) throw new Error("Failed to fetch secret word");
  
        const data = await res.json();
        setSecretWord(data.word);
      } catch (error) {
        console.error("Error fetching secret word:", error);
      }
    };
  
    fetchSecretWord();
  }, []);


  const checkGuess = (guess) => {
    let result = new Array(guess.length).fill('wrong');
    let secretLetters = secretWord.split('');
    let secretCount = {};

    for (let letter of secretLetters) {
        secretCount[letter] = (secretCount[letter] || 0) + 1;
    }

    for (let i = 0; i < guess.length; i++) {
        if (guess[i] === secretLetters[i]) {
            result[i] = 'correct';
            secretCount[guess[i]] -= 1;
        }
    }

    for (let i = 0; i < guess.length; i++) {
        if (result[i] === 'correct') continue;
        if (secretCount[guess[i]] > 0) {
            result[i] = 'wrong-position';
            secretCount[guess[i]] -= 1;
        }
    }

    if (guess === secretWord) {
        result = new Array(guess.length).fill('correct');
    }

    return result;
};

  const resetGame = async () => {
    setGrid(Array(30).fill(''));
    setCurrentRow(0);
    setIsGameOver(false);
    setGuesses([]);

    try {
        const response = await fetch(`${API_URL}/secret-word`, { credentials: "include" });
        if (response.ok) {
            const data = await response.json();
            setSecretWord(data.word);
        } else {
            console.error("Failed to fetch new secret word");
        }
    } catch (error) {
        console.error("Error fetching new secret word:", error);
    }

    setTimeout(() => {
        if (inputRefs.current[0]) {
            inputRefs.current[0].focus();
        }
    }, 100);
};

  const handleInputChange = (e, index) => {
    const value = e.target.value.toUpperCase();
    if (value.length > 1) return;

    const newGrid = [...grid];
    newGrid[index] = value;
    setGrid(newGrid);

    if (value && index < inputRefs.current.length - 1) {
        const nextIndex = index + 1;
        if (Math.floor(nextIndex / 5) === currentRow) {
            inputRefs.current[nextIndex]?.focus();
        }
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace' && grid[index] === '' && index > 0) {
      inputRefs.current[index - 1].focus();
    }

    if (e.key === 'Enter') {
      const guess = grid.slice(currentRow * 5, (currentRow + 1) * 5).join('');
      if (guess.length === 5) {
        if (!validWords.includes(guess)) {
          alert('This word is not in the list of valid words!');
          return;
        }

        const result = checkGuess(guess);

        if (guess === secretWord) {
          const correctResult = new Array(5).fill('correct');
          setGuesses((prevGuesses) => {
              const newGuesses = [...prevGuesses];
              newGuesses[currentRow] = correctResult;
              return newGuesses;
          });
      
          alert('Congratulations, you guessed the word!');
          setIsGameOver(true);
          socket.emit("gameWin", user?.username);

          setTimeout(async () => {
            if (window.confirm('Do you want to play again?')) {
                await resetGame();
            }
          }, 100);
          return;
        } else {
          setGuesses((prevGuesses) => [...prevGuesses, result]);
          setCurrentRow((prevRow) => prevRow + 1);
        }

        if (currentRow === 5 && guess !== secretWord) {
          setIsGameOver(true);
          if (window.confirm(`Game Over! The word was: ${secretWord}. Do you want to play again?`)) {
            resetGame();
          }
        }
      }
    }
  };

  const isRowEditable = (index) => {
    return Math.floor(index / 5) === currentRow;
  };

  useEffect(() => {
    if (currentRow < 6 && inputRefs.current[currentRow * 5]) {
      inputRefs.current[currentRow * 5].focus();
    }

    socket.on("leaderboard", (user) => {
      setLeader(user);
    });

    return () => {
      socket.off("leaderboard");
    };
  }, [currentRow]);

  return (
    <div>
      <div className='game-grid'>
        {grid.map((letter, index) => {
          let className = '';
          const guessRow = Math.floor(index / 5);

          if (guesses[guessRow]) {
              const result = guesses[guessRow][index % 5];
              if (result === 'correct') {
                  className = 'correct';
              } else if (result === 'wrong-position') {
                  className = 'wrong-position';
              } else if (result === 'wrong') {
                  className = 'wrong';
              }
          }

          return (
              <input
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)}
                  className={`box-input ${className}`}
                  value={letter}
                  maxLength={1}
                  type="text"
                  onChange={(e) => handleInputChange(e, index)}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                  disabled={isGameOver || !isRowEditable(index)}
              />
          );
      })}
      </div>
      <div>
        <button className='reset-button' onClick={resetGame}>
          reset game
        </button>
      </div>

      
    
      <div>
      {leader && (
        <div className="leaderboard">
          <h3>Leader of the Day:</h3>
          <p>{leader.username} with {leader.wins} wins</p>
        </div>
      )}
      </div>
      </div>
  );
}