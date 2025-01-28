import React from 'react';
import GameGrid from './components/GameGrid';
import Header from './components/Header';

export default function Page() {
  return (
    <div>
      <Header />
      <div>
        <h1>Guess the word!</h1>
        <GameGrid />
      </div>
    </div>
  );
}

