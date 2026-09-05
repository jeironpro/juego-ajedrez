import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { WHITE, BLACK } from '@/features/game/constants.js';
import Scoreboard from './Scoreboard.jsx';

describe('Scoreboard', () => {
  it('muestra los nombres, los contadores y el marcador vs', () => {
    render(
      <Scoreboard
        player1Name="TÚ"
        player2Name="BOT"
        player1Score={3}
        player2Score={1}
        turn={WHITE}
      />,
    );
    expect(screen.getByText('TÚ')).toBeInTheDocument();
    expect(screen.getByText('BOT')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('vs')).toBeInTheDocument();
  });

  it('muestra el badge de dificultad cuando se proporciona', () => {
    render(
      <Scoreboard
        player1Name="TÚ"
        player2Name="BOT"
        player1Score={0}
        player2Score={0}
        turn={WHITE}
        badge="Difícil"
      />,
    );
    expect(screen.getByText('Difícil')).toBeInTheDocument();
  });

  it('no muestra un botón de reinicio del marcador', () => {
    render(
      <Scoreboard
        player1Name="TÚ"
        player2Name="BOT"
        player1Score={0}
        player2Score={0}
        turn={WHITE}
      />,
    );
    expect(screen.queryByLabelText('Reiniciar marcador')).not.toBeInTheDocument();
  });

  it('resalta al jugador en turno', () => {
    const { container } = render(
      <Scoreboard
        player1Name="TÚ"
        player2Name="BOT"
        player1Score={0}
        player2Score={0}
        turn={BLACK}
      />,
    );
    const activeScore = container.querySelector('.scoreboard__score--active');
    expect(activeScore).toHaveTextContent('0');
    expect(activeScore.className).toContain('scoreboard__score--active');
    expect(container.querySelectorAll('.scoreboard__score--active')).toHaveLength(1);
  });
});
