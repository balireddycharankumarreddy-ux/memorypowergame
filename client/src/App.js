import React, { useState } from 'react';
import MemoryCardGame from './components/MemoryCardGame';
import './App.css';

function App() {
  const [gameKey, setGameKey] = useState(0);

  const handleNewGame = () => {
    setGameKey(prev => prev + 1);
  };

  return (
    <div className="app">
      <MemoryCardGame key={gameKey} onNewGame={handleNewGame} />
    </div>
  );
}

export default App;
