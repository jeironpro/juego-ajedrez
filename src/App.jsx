import { useState, useCallback } from 'react';
import { useGame } from '@/hooks/useGame.js';
import HomeScreen from '@/features/menu/HomeScreen.jsx';
import GameScreen from '@/features/game/GameScreen.jsx';
import { DIFFICULTY_LABELS, DEFAULT_DIFFICULTY } from '@/features/bot/difficulty.js';
import './App.css';

function App() {
  const [screen, setScreen] = useState('home');
  const [mode, setMode] = useState('bot');
  const [difficulty, setDifficulty] = useState(DEFAULT_DIFFICULTY);
  const { game, makeMove, undo, restart } = useGame({
    botDifficulty: mode === 'bot' ? difficulty : null,
  });

  const startGame = useCallback(
    (nextMode, nextDifficulty) => {
      setMode(nextMode);
      setDifficulty(nextDifficulty);
      restart();
      setScreen('game');
    },
    [restart],
  );

  const goHome = useCallback(() => {
    // se reinicia la partida para cancelar turnos pendientes del bot al salir
    restart();
    setScreen('home');
  }, [restart]);

  return (
    <div className="app">
      {screen === 'home' ? (
        <HomeScreen onStart={startGame} />
      ) : (
        <GameScreen
          game={game}
          onMove={makeMove}
          onUndo={undo}
          onRestart={restart}
          onMenu={goHome}
          player1Name={mode === 'bot' ? 'TÚ' : 'Jugador 1'}
          player2Name={mode === 'bot' ? 'BOT' : 'Jugador 2'}
          badge={mode === 'bot' ? DIFFICULTY_LABELS[difficulty] : '2 JUGADORES'}
          botMode={mode === 'bot'}
        />
      )}
    </div>
  );
}

export default App;
