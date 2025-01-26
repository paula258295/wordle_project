'use client'
import React, { useState, useRef, useEffect } from 'react';
import './GameGrid.css';

export default function GameGrid() {
  const SECRET_WORD = 'APPLE';
  const VALID_WORDS = ['APPLE', 'GRAPE', 'PEACH', 'PLUMB', 'MANGO', 'BERRY', 'REACT'];
  const [grid, setGrid] = useState(Array(30).fill(''));
  const [currentRow, setCurrentRow] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [guesses, setGuesses] = useState([]);
  const inputRefs = useRef([]);

  const checkGuess = (guess) => {
    let result = new Array(guess.length).fill('wrong');
    let secretLetters = SECRET_WORD.split('');
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

    return result;
  };

  const resetGame = () => {
    setGrid(Array(30).fill(''));
    setCurrentRow(0);
    setIsGameOver(false);
    setGuesses([]);
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
        if (!VALID_WORDS.includes(guess)) {
          alert('This word is not in the list of valid words!');
          return;
        }

        const result = checkGuess(guess);

        if (guess === SECRET_WORD) {
          alert('Congratulations, you guessed the word!');
          setIsGameOver(true);
          if (window.confirm('Do you want to play again?')) {
            resetGame();
          }
        } else {
          setGuesses((prevGuesses) => [...prevGuesses, result]);
          setCurrentRow((prevRow) => prevRow + 1);
        }

        if (currentRow === 5 && guess !== SECRET_WORD) {
          setIsGameOver(true);
          if (window.confirm(`Game Over! The word was: ${SECRET_WORD}. Do you want to play again?`)) {
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
  }, [currentRow]);


  return (
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
      <div>
        <button className='reset-button' onClick={resetGame}>
          reset game
        </button>
      </div>
    </div>
  );
}