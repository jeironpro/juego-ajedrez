import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { WHITE, BLACK } from '@/features/game/constants.js';
import Scoreboard from './Scoreboard.jsx';

describe('Scoreboard', () => {
  it('muestra los nombres y las piezas restantes de cada jugador', () => {
    render(
      <Scoreboard
        player1Name="TÚ"
        player2Name="BOT"
        player1Pieces={16}
        player2Pieces={12}
        turn={WHITE}
      />,
    );
    expect(screen.getByText('TÚ')).toBeInTheDocument();
    expect(screen.getByText('BOT')).toBeInTheDocument();
    expect(screen.getByText('16')).toBeInTheDocument();
    expect(screen.getByText('12')).toBeInTheDocument();
    expect(screen.getByText('vs')).toBeInTheDocument();
  });

  it('arranca con 16 piezas por jugador cuando no se pasan contadores', () => {
    render(<Scoreboard player1Name="TÚ" player2Name="BOT" turn={WHITE} />);
    expect(screen.getAllByText('16')).toHaveLength(2);
  });

  it('muestra el badge de dificultad cuando se proporciona', () => {
    render(
      <Scoreboard
        player1Name="TÚ"
        player2Name="BOT"
        player1Pieces={16}
        player2Pieces={16}
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
        player1Pieces={16}
        player2Pieces={16}
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
        player1Pieces={16}
        player2Pieces={16}
        turn={BLACK}
      />,
    );
    const activeCount = container.querySelector('.scoreboard__count--active');
    expect(activeCount).toHaveTextContent('16');
    expect(activeCount.className).toContain('scoreboard__count--active');
    expect(container.querySelectorAll('.scoreboard__count--active')).toHaveLength(1);
  });
});
