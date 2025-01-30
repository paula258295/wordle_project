import React from 'react';
import GameGrid from './components/GameGrid';
import Header from './components/Header';
import Chat from './components/Chat';

export default function Page() {
  return (
    <div>
      <Header />
      <div>
        <h1>Guess the word!</h1>
        <div className='main'>
          <GameGrid className='game'/>
          <Chat className='chat'/>
        </div>
      </div>
    </div>
  );
}

