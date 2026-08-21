import React, { useState, useEffect, useCallback, useRef } from 'react';
import Confetti from './Confetti';
import soundEffects from '../utils/soundEffects';
import './MemoryCardGame.css';

// Emoji sets for different difficulties
const CARD_SETS = {
  easy: ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊'],
  medium: ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯'],
  hard: ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵', '🐔']
};

// Time limits for countdown mode (in seconds)
const TIME_LIMITS = {
  easy: 60,      // 1 minute
  medium: 120,   // 2 minutes
  hard: 180      // 3 minutes
};

// Shuffle array
const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

// Generate cards for a given difficulty
const generateCards = (difficulty) => {
  const emojis = CARD_SETS[difficulty];
  const cardPairs = [...emojis, ...emojis];
  const shuffled = shuffleArray(cardPairs);
  return shuffled.map((emoji, index) => ({
    id: index,
    emoji,
    isFlipped: false,
    isMatched: false
  }));
};

// Star rating based on moves
const getStarRating = (moves, difficulty) => {
  const totalPairs = CARD_SETS[difficulty].length;
  const ratio = moves / totalPairs;
  if (ratio <= 1.3) return 3;
  if (ratio <= 1.8) return 2;
  return 1;
};

// Time bonus stars for countdown mode
const getCountdownStars = (timeLeft, difficulty) => {
  const totalTime = TIME_LIMITS[difficulty];
  const timeUsed = totalTime - timeLeft;
  const totalPairs = CARD_SETS[difficulty].length;
  const secondsPerPair = timeUsed / totalPairs;
  if (secondsPerPair <= 4) return 3;
  if (secondsPerPair <= 7) return 2;
  return 1;
};

const MemoryCardGame = ({ onNewGame }) => {
  const [cards, setCards] = useState([]);
  const [flippedCards, setFlippedCards] = useState([]);
  const [moves, setMoves] = useState(0);
  const [pairsFound, setPairsFound] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [gameComplete, setGameComplete] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [difficulty, setDifficulty] = useState('medium');
  const [timer, setTimer] = useState(0);
  const [countdown, setCountdown] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playerName, setPlayerName] = useState('');
  const [showNameInput, setShowNameInput] = useState(false);
  const [leaderboard, setLeaderboard] = useState([]);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [matchAnimation, setMatchAnimation] = useState([]);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showMatchConfetti, setShowMatchConfetti] = useState(false);
  const [showWinConfetti, setShowWinConfetti] = useState(false);
  const [bestScore, setBestScore] = useState(null);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [cardShake, setCardShake] = useState([]);
  const [comboText, setComboText] = useState('');
  const [gameMode, setGameMode] = useState('classic'); // 'classic' or 'countdown'
  const [timeWarning, setTimeWarning] = useState(false); // warning state for low time
  const [timeCritical, setTimeCritical] = useState(false); // critical state for very low time
  const matchTimeoutRef = useRef(null);
  const countdownRef = useRef(null);

  // Total pairs for current difficulty
  const totalPairs = CARD_SETS[difficulty].length;

  // Initialize sound effects on first user interaction
  useEffect(() => {
    const initSound = () => {
      soundEffects.init();
      document.removeEventListener('click', initSound);
    };
    document.addEventListener('click', initSound);
    return () => document.removeEventListener('click', initSound);
  }, []);

  // Initialize game
  const initGame = useCallback(() => {
    setCards(generateCards(difficulty));
    setFlippedCards([]);
    setMoves(0);
    setPairsFound(0);
    setIsLocked(false);
    setGameComplete(false);
    setGameOver(false);
    setTimer(0);
    setCountdown(gameMode === 'countdown' ? TIME_LIMITS[difficulty] : 0);
    setIsPlaying(false);
    setShowNameInput(false);
    setMatchAnimation([]);
    setShowMatchConfetti(false);
    setShowWinConfetti(false);
    setStreak(0);
    setBestStreak(0);
    setComboText('');
    setCardShake([]);
    setTimeWarning(false);
    setTimeCritical(false);
    if (matchTimeoutRef.current) clearTimeout(matchTimeoutRef.current);
    if (countdownRef.current) clearInterval(countdownRef.current);
  }, [difficulty, gameMode]);

  useEffect(() => {
    initGame();
  }, [initGame]);

  // Classic mode timer effect
  useEffect(() => {
    let interval;
    if (isPlaying && !gameComplete && !gameOver && gameMode === 'classic') {
      interval = setInterval(() => {
        setTimer(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, gameComplete, gameOver, gameMode]);

  // Countdown mode timer effect
  useEffect(() => {
    if (isPlaying && !gameComplete && !gameOver && gameMode === 'countdown') {
      countdownRef.current = setInterval(() => {
        setCountdown(prev => {
          const newTime = prev - 1;
          // Warning states
          if (newTime <= 10 && newTime > 5) {
            setTimeWarning(true);
            setTimeCritical(false);
          } else if (newTime <= 5) {
            setTimeWarning(false);
            setTimeCritical(true);
            // Play warning sound at 5 seconds
            if (newTime === 5) {
              soundEffects.noMatch();
            }
          }
          // Time's up
          if (newTime <= 0) {
            clearInterval(countdownRef.current);
            setGameOver(true);
            setIsPlaying(false);
            soundEffects.noMatch();
            setTimeout(() => soundEffects.noMatch(), 200);
            setTimeout(() => soundEffects.noMatch(), 400);
            return 0;
          }
          return newTime;
        });
      }, 1000);
    }
    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, [isPlaying, gameComplete, gameOver, gameMode]);

  // Check for game completion
  useEffect(() => {
    if (pairsFound === totalPairs && pairsFound > 0) {
      setGameComplete(true);
      setIsPlaying(false);
      setShowNameInput(true);
      setShowWinConfetti(true);
      soundEffects.gameWon();

      // Stop win confetti after 5 seconds
      setTimeout(() => setShowWinConfetti(false), 5000);

      // Check best score
      if (!bestScore || moves < bestScore.moves) {
        setBestScore({ moves, time: timer, difficulty, mode: gameMode });
      }

      // Clear countdown timer
      if (countdownRef.current) clearInterval(countdownRef.current);
    }
  }, [pairsFound, totalPairs, moves, timer, bestScore, gameMode]);

  // Fetch leaderboard
  useEffect(() => {
    fetchLeaderboard();
  }, [difficulty]);

  const fetchLeaderboard = async () => {
    try {
      const response = await fetch(`/api/scores?difficulty=${difficulty}&limit=10`);
      if (response.ok) {
        const data = await response.json();
        setLeaderboard(data);
      }
    } catch (error) {
      console.log('Could not fetch leaderboard - server might be offline');
    }
  };

  // Handle card click
  const handleCardClick = (id) => {
    if (isLocked) return;
    if (flippedCards.length === 2) return;
    if (gameOver) return;

    const clickedCard = cards.find(card => card.id === id);
    if (clickedCard.isFlipped || clickedCard.isMatched) return;

    // Initialize audio context on first interaction
    soundEffects.ensureContext();

    // Play flip sound
    soundEffects.flipCard();

    // Start timer on first click
    if (!isPlaying) {
      setIsPlaying(true);
    }

    // Flip the card
    setCards(prev =>
      prev.map(card =>
        card.id === id ? { ...card, isFlipped: true } : card
      )
    );

    setFlippedCards(prev => [...prev, id]);

    // Check for match if two cards are flipped
    if (flippedCards.length === 1) {
      setMoves(prev => prev + 1);
      setIsLocked(true);

      const firstCard = cards.find(card => card.id === flippedCards[0]);
      const secondCard = cards.find(card => card.id === id);

      if (firstCard.emoji === secondCard.emoji) {
        // Match found!
        const newStreak = streak + 1;
        setStreak(newStreak);
        if (newStreak > bestStreak) setBestStreak(newStreak);

        // Show combo text for streaks
        if (newStreak >= 3) {
          setComboText(`🔥 ${newStreak}x Combo!`);
          setTimeout(() => setComboText(''), 1500);
        } else if (newStreak === 2) {
          setComboText('✨ Nice!');
          setTimeout(() => setComboText(''), 1200);
        }

        soundEffects.matchFound();
        setMatchAnimation([firstCard.id, secondCard.id]);

        // Small confetti burst for each match
        setShowMatchConfetti(true);
        setTimeout(() => setShowMatchConfetti(false), 600);

        if (matchTimeoutRef.current) clearTimeout(matchTimeoutRef.current);
        matchTimeoutRef.current = setTimeout(() => {
          setCards(prev =>
            prev.map(card =>
              card.id === firstCard.id || card.id === secondCard.id
                ? { ...card, isMatched: true }
                : card
            )
          );
          setPairsFound(prev => prev + 1);
          setFlippedCards([]);
          setIsLocked(false);
          setMatchAnimation([]);
        }, 600);
      } else {
        // No match - shake cards and flip back
        setStreak(0);
        setCardShake([firstCard.id, secondCard.id]);
        soundEffects.noMatch();

        setTimeout(() => {
          setCards(prev =>
            prev.map(card =>
              card.id === firstCard.id || card.id === secondCard.id
                ? { ...card, isFlipped: false }
                : card
            )
          );
          setFlippedCards([]);
          setIsLocked(false);
          setCardShake([]);
        }, 1000);
      }
    }
  };

  // Save score
  const saveScore = async () => {
    if (!playerName.trim()) return;

    soundEffects.scoreSaved();

    try {
      const response = await fetch('/api/scores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          playerName: playerName.trim(),
          moves,
          time: timer,
          pairsFound,
          difficulty,
          gameMode,
          timeLeft: gameMode === 'countdown' ? countdown : undefined
        })
      });

      if (response.ok) {
        setShowNameInput(false);
        fetchLeaderboard();
      }
    } catch (error) {
      console.log('Could not save score - server might be offline');
      setShowNameInput(false);
    }
  };

  // Format time
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Handle difficulty change
  const handleDifficultyChange = (newDifficulty) => {
    soundEffects.difficultyChange();
    setDifficulty(newDifficulty);
  };

  // Handle game mode change
  const handleModeChange = (mode) => {
    soundEffects.buttonClick();
    setGameMode(mode);
  };

  // Toggle sound
  const toggleSound = () => {
    const newState = soundEffects.toggle();
    setSoundEnabled(newState);
  };

  // Get card grid class based on difficulty
  const getGridClass = () => {
    switch (difficulty) {
      case 'easy': return 'grid-easy';
      case 'medium': return 'grid-medium';
      case 'hard': return 'grid-hard';
      default: return 'grid-medium';
    }
  };

  // Star rating
  const stars = gameComplete
    ? (gameMode === 'countdown' ? getCountdownStars(countdown, difficulty) : getStarRating(moves, difficulty))
    : 0;

  // Calculate timer progress percentage for countdown mode
  const timerProgress = gameMode === 'countdown'
    ? (countdown / TIME_LIMITS[difficulty]) * 100
    : 0;

  // Get timer display class based on time remaining
  const getTimerClass = () => {
    if (gameMode !== 'countdown') return '';
    if (timeCritical) return 'timer-critical';
    if (timeWarning) return 'timer-warning';
    return '';
  };

  return (
    <div className="game-container">
      {/* Confetti Effects */}
      <Confetti active={showMatchConfetti} type="burst" />
      <Confetti active={showWinConfetti} type="rain" />

      {/* Header with sound toggle */}
      <div className="header">
        <h1 className="game-title">🧠 Memory Card Game</h1>
        <button
          className="sound-toggle"
          onClick={toggleSound}
          title={soundEnabled ? 'Mute sounds' : 'Enable sounds'}
        >
          {soundEnabled ? '🔊' : '🔇'}
        </button>
      </div>

      {/* Combo Text */}
      {comboText && (
        <div className="combo-text">{comboText}</div>
      )}

      {/* Game Mode Selector */}
      <div className="mode-selector">
        <button
          className={`mode-btn ${gameMode === 'classic' ? 'active' : ''}`}
          onClick={() => handleModeChange('classic')}
        >
          ⏱️ Classic
        </button>
        <button
          className={`mode-btn ${gameMode === 'countdown' ? 'active' : ''}`}
          onClick={() => handleModeChange('countdown')}
        >
          ⚡ Countdown
        </button>
      </div>

      {/* Countdown Timer Bar */}
      {gameMode === 'countdown' && (
        <div className="countdown-container">
          <div className={`countdown-bar ${getTimerClass()}`}>
            <div
              className="countdown-progress"
              style={{ width: `${timerProgress}%` }}
            />
          </div>
          <div className={`countdown-time ${getTimerClass()}`}>
            ⏱️ {formatTime(countdown)}
          </div>
        </div>
      )}

      {/* Game Stats */}
      <div className="game-stats">
        <div className="stat">
          <span className="stat-label">Moves</span>
          <span className="stat-value">{moves}</span>
        </div>
        <div className="stat">
          <span className="stat-label">Pairs</span>
          <span className="stat-value">{pairsFound}/{totalPairs}</span>
        </div>
        {gameMode === 'classic' && (
          <div className="stat">
            <span className="stat-label">Time</span>
            <span className="stat-value">{formatTime(timer)}</span>
          </div>
        )}
        <div className="stat">
          <span className="stat-label">Streak</span>
          <span className="stat-value">🔥 {streak}</span>
        </div>
        {bestStreak > 0 && (
          <div className="stat">
            <span className="stat-label">Best Streak</span>
            <span className="stat-value">⭐ {bestStreak}</span>
          </div>
        )}
      </div>

      {/* Difficulty Selector */}
      <div className="difficulty-selector">
        <button
          className={`diff-btn ${difficulty === 'easy' ? 'active' : ''}`}
          onClick={() => handleDifficultyChange('easy')}
        >
          😊 Easy (6 pairs)
        </button>
        <button
          className={`diff-btn ${difficulty === 'medium' ? 'active' : ''}`}
          onClick={() => handleDifficultyChange('medium')}
        >
          🤔 Medium (10 pairs)
        </button>
        <button
          className={`diff-btn ${difficulty === 'hard' ? 'active' : ''}`}
          onClick={() => handleDifficultyChange('hard')}
        >
          🔥 Hard (16 pairs)
        </button>
      </div>

      {/* Time Limit Info for Countdown Mode */}
      {gameMode === 'countdown' && (
        <div className="time-limit-info">
          <span>⏱️ Time Limit: {formatTime(TIME_LIMITS[difficulty])}</span>
        </div>
      )}

      {/* Card Grid */}
      <div className={`card-grid ${getGridClass()}`}>
        {cards.map(card => (
          <div
            key={card.id}
            className={`card ${card.isFlipped || card.isMatched ? 'flipped' : ''} ${
              card.isMatched ? 'matched' : ''
            } ${matchAnimation.includes(card.id) ? 'match-animate' : ''} ${
              cardShake.includes(card.id) ? 'shake' : ''
            }`}
            onClick={() => handleCardClick(card.id)}
          >
            <div className="card-inner">
              <div className="card-front">❓</div>
              <div className="card-back">{card.emoji}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Game Complete Modal */}
      {gameComplete && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>🎉 Congratulations!</h2>
            <p>You completed the game!</p>

            {/* Star Rating */}
            <div className="star-rating">
              {[1, 2, 3].map(i => (
                <span key={i} className={`star ${i <= stars ? 'filled' : ''}`}>
                  ★
                </span>
              ))}
            </div>

            <div className="final-stats">
              <p><strong>Moves:</strong> {moves}</p>
              {gameMode === 'classic' && (
                <p><strong>Time:</strong> {formatTime(timer)}</p>
              )}
              {gameMode === 'countdown' && (
                <p><strong>Time Left:</strong> {formatTime(countdown)}</p>
              )}
              <p><strong>Difficulty:</strong> {difficulty}</p>
              <p><strong>Mode:</strong> {gameMode === 'classic' ? '⏱️ Classic' : '⚡ Countdown'}</p>
              <p><strong>Best Streak:</strong> 🔥 {bestStreak}</p>
            </div>

            {/* Best Score Badge */}
            {bestScore && bestScore.moves === moves && (
              <div className="best-score-badge">🏆 New Best Score!</div>
            )}

            {showNameInput && (
              <div className="name-input-container">
                <input
                  type="text"
                  placeholder="Enter your name"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  maxLength={20}
                  className="name-input"
                  onKeyPress={(e) => e.key === 'Enter' && saveScore()}
                  autoFocus
                />
                <button className="save-btn" onClick={saveScore}>
                  Save Score
                </button>
              </div>
            )}

            <button className="new-game-btn" onClick={initGame}>
              Play Again
            </button>
          </div>
        </div>
      )}

      {/* Game Over Modal (Time's Up) */}
      {gameOver && (
        <div className="modal-overlay game-over-overlay">
          <div className="modal game-over-modal">
            <h2>⏰ Time's Up!</h2>
            <p>You ran out of time!</p>

            <div className="final-stats">
              <p><strong>Pairs Found:</strong> {pairsFound}/{totalPairs}</p>
              <p><strong>Moves:</strong> {moves}</p>
              <p><strong>Time Limit:</strong> {formatTime(TIME_LIMITS[difficulty])}</p>
              <p><strong>Difficulty:</strong> {difficulty}</p>
              <p><strong>Best Streak:</strong> 🔥 {bestStreak}</p>
            </div>

            <div className="game-over-message">
              {pairsFound >= totalPairs * 0.75 && (
                <p className="near-win">So close! You found {Math.round((pairsFound / totalPairs) * 100)}% of pairs!</p>
              )}
              {pairsFound < totalPairs * 0.75 && pairsFound >= totalPairs * 0.5 && (
                <p className="good-try">Good try! You found {Math.round((pairsFound / totalPairs) * 100)}% of pairs.</p>
              )}
              {pairsFound < totalPairs * 0.5 && (
                <p className="keep-trying">Keep practicing! You'll get better! 💪</p>
              )}
            </div>

            <button className="new-game-btn" onClick={initGame}>
              Try Again
            </button>
          </div>
        </div>
      )}

      {/* Leaderboard Toggle */}
      <button
        className="leaderboard-toggle"
        onClick={() => {
          soundEffects.buttonClick();
          setShowLeaderboard(!showLeaderboard);
          if (!showLeaderboard) fetchLeaderboard();
        }}
      >
        🏆 Leaderboard
      </button>

      {/* Leaderboard */}
      {showLeaderboard && (
        <div className="leaderboard">
          <h3>🏆 Top Players ({difficulty})</h3>
          {leaderboard.length === 0 ? (
            <p className="no-scores">No scores yet. Be the first!</p>
          ) : (
            <table className="leaderboard-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Player</th>
                  <th>Moves</th>
                  <th>Time</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.map((score, index) => (
                  <tr key={score._id}>
                    <td>{index + 1}</td>
                    <td>{score.playerName}</td>
                    <td>{score.moves}</td>
                    <td>{formatTime(score.time)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Rules */}
      <div className="rules">
        <h3>📖 How to Play</h3>
        <ul>
          <li>Click on a card to flip it and reveal the emoji</li>
          <li>Click on a second card to find a match</li>
          <li>If two cards match, they stay flipped</li>
          <li>If they don't match, they flip back</li>
          <li>Find all pairs to win!</li>
          <li>Build streaks for combos — 3+ in a row gets a combo bonus!</li>
        </ul>
        {gameMode === 'countdown' && (
          <div className="rules-countdown">
            <h4>⚡ Countdown Mode</h4>
            <ul>
              <li>You have {formatTime(TIME_LIMITS[difficulty])} to complete the game</li>
              <li>Match all pairs before time runs out!</li>
              <li>Warning: Timer turns yellow at 10s, red at 5s!</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default MemoryCardGame;
