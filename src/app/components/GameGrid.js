'use client'
import React, { useState, useRef } from 'react';
import './GameGrid.css';

export default function GameGrid() {
    const [grid, setGrid] = useState(Array(30).fill(''));
    const inputRefs = useRef([]);

    const handleInputChange = (e, index) => {
        const value = e.target.value.toUpperCase();
        if (value.length > 1) return;

        const newGrid = [...grid];
        newGrid[index] = value;
        setGrid(newGrid);

        if (value && index < inputRefs.current.length - 1) {
            inputRefs.current[index + 1].focus();
        }
    };

    const handleKeyDown = (e, index) => {
        if (e.key === 'Backspace' && grid[index] === '' && index > 0) {
            inputRefs.current[index - 1].focus();
        }
    };

    return (
        <div className='game-grid'>
            {grid.map((letter, index) => (
                <input
                    key={index}
                    ref={(el) => (inputRefs.current[index] = el)}
                    className='box-input'
                    value={letter}
                    maxLength={1}
                    type='text'
                    onChange={(e) => handleInputChange(e, index)}
                    onKeyDown={(e) => handleKeyDown(e, index)}
                />
            ))}
        </div>
    );
}
