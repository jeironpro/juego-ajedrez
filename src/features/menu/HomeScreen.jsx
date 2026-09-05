import { useState } from 'react';
import Button from '@/components/ui/Button.jsx';
import Icon from '@/components/ui/Icon.jsx';
import { DIFFICULTIES, DIFFICULTY_LABELS, DEFAULT_DIFFICULTY } from '@/features/bot/difficulty.js';
import './HomeScreen.css';

// Modos de juego disponibles
const MODES = [
  {
    id: 'bot',
    label: 'Jugar vs Bot',
    description: 'Enfréntate al bot en el tablero',
    icon: 'smart_toy',
  },
  {
    id: 'local',
    label: '2 Jugadores',
    description: 'Comparte el tablero con otra persona',
    icon: 'group',
  },
];

// Pantalla de inicio: se elige el modo y, si es contra el bot, la dificultad
function HomeScreen({ onStart }) {
  const [selectedMode, setSelectedMode] = useState(null);
  const [difficulty, setDifficulty] = useState(DEFAULT_DIFFICULTY);

  const handleStart = () => {
    if (selectedMode !== null) {
      onStart(selectedMode, difficulty);
    }
  };

  return (
    <div className="home">
      <header className="home__header">
        <Icon name="sports_esports" />
        <h1 className="home__title">Ajedrez</h1>
        <p className="home__subtitle">Elige cómo quieres jugar</p>
      </header>

      <div className="home__modes">
        {MODES.map((mode) => (
          <button
            key={mode.id}
            type="button"
            className={`home__mode${selectedMode === mode.id ? ' home__mode--selected' : ''}`}
            onClick={() => setSelectedMode(mode.id)}
            aria-pressed={selectedMode === mode.id}
          >
            <Icon name={mode.icon} />
            <span className="home__mode-label">{mode.label}</span>
            <span className="home__mode-description">{mode.description}</span>
          </button>
        ))}
      </div>

      {selectedMode === 'bot' && (
        <div className="home__difficulty" role="group" aria-label="Dificultad del bot">
          {DIFFICULTIES.map((level) => (
            <button
              key={level}
              type="button"
              className={`home__difficulty-option${
                difficulty === level ? ' home__difficulty-option--active' : ''
              }`}
              onClick={() => setDifficulty(level)}
              aria-pressed={difficulty === level}
            >
              {DIFFICULTY_LABELS[level]}
            </button>
          ))}
        </div>
      )}

      <Button icon="play_arrow" onClick={handleStart} disabled={selectedMode === null}>
        Jugar
      </Button>
    </div>
  );
}

export default HomeScreen;
