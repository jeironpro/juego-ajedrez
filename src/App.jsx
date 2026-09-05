import { useState, useCallback } from 'react';
import { useGame } from '@/hooks/useGame.js';
import HomeScreen from '@/features/menu/HomeScreen.jsx';
import GameScreen from '@/features/game/GameScreen.jsx';
import { DIFFICULTY_LABELS, DEFAULT_DIFFICULTY } from '@/features/bot/difficulty.js';
import { WHITE, BLACK } from '@/features/game/constants.js';
import './App.css';

// Marcador de victorias de la sesión: TÚ (blancas) y BOT (negras)
function App() {
  const [screen, setScreen] = useState('home');
  const [mode, setMode] = useState('bot');
  const [difficulty, setDifficulty] = useState(DEFAULT_DIFFICULTY);
  const [score, setScore] = useState({ [WHITE]: 0, [BLACK]: 0 });
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

  // Al terminar una partida se suma la victoria al marcador de la sesión
  const handleGameOver = useCallback((winner) => {
    setScore((current) =>
      winner === null ? current : { ...current, [winner]: current[winner] + 1 },
    );
  }, []);

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
          onGameOver={handleGameOver}
          player1Name={mode === 'bot' ? 'TÚ' : 'Jugador 1'}
          player2Name={mode === 'bot' ? 'BOT' : 'Jugador 2'}
          badge={mode === 'bot' ? DIFFICULTY_LABELS[difficulty] : '2 JUGADORES'}
          botMode={mode === 'bot'}
          player1Score={score[WHITE]}
          player2Score={score[BLACK]}
        />
      )}
    </div>
  );
}

export default App;
