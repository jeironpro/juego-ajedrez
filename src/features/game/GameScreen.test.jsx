import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createGame, applyMove } from '@/features/game/game.js';
import { getLegalMoves, moveKey } from '@/features/game/moves.js';
import { applyMoveToBoard } from '@/features/game/apply.js';
import { WHITE } from '@/features/game/constants.js';
import GameScreen from './GameScreen.jsx';

// Busca un movimiento por su notación origen-destino entre los legales del turno
function findMove(game, notation) {
  return getLegalMoves(game.board, game.turn, {
    castlingRights: game.castlingRights,
    enPassantTarget: game.enPassantTarget,
    applyMoveToBoardFn: applyMoveToBoard,
  }).find((move) => moveKey(move) === notation);
}

// Aplica una jugada buscándola por notación
function play(game, notation) {
  const move = findMove(game, notation);
  if (move === undefined) throw new Error(`Movimiento no legal: ${notation}`);
  return applyMove(game, move);
}

// Posición con una jugada hecha para poder deshacer
function gameWithHistory() {
  return play(createGame(), 'e2e4');
}

// Posición con una captura hecha por las blancas para probar las bandejas
function gameWithCapture() {
  return play(play(play(createGame(), 'e2e4'), 'd7d5'), 'e4d5');
}

function renderGameScreen(props = {}) {
  return render(
    <GameScreen
      game={createGame()}
      onMove={vi.fn()}
      onUndo={vi.fn()}
      onRestart={vi.fn()}
      onMenu={vi.fn()}
      onGameOver={vi.fn()}
      player1Name="TÚ"
      player2Name="BOT"
      {...props}
    />,
  );
}

describe('GameScreen', () => {
  it('muestra el marcador con TÚ y BOT', () => {
    renderGameScreen();
    expect(screen.getByText('TÚ')).toBeInTheDocument();
    expect(screen.getByText('BOT')).toBeInTheDocument();
  });

  it('deshabilita deshacer al inicio de la partida', () => {
    renderGameScreen();
    expect(screen.getByText('Deshacer')).toBeDisabled();
  });

  it('habilita deshacer tras una jugada y lo notifica', async () => {
    const onUndo = vi.fn();
    const user = userEvent.setup();
    renderGameScreen({ game: gameWithHistory(), onUndo });
    expect(screen.getByText('Deshacer')).not.toBeDisabled();
    await user.click(screen.getByText('Deshacer'));
    expect(onUndo).toHaveBeenCalledTimes(1);
  });

  it('muestra la bandeja de capturas junto al jugador que comió la pieza', () => {
    renderGameScreen({ game: gameWithCapture() });
    // Las blancas comieron un peón negro: aparece junto a TÚ y no junto a BOT
    expect(screen.getByLabelText(/Piezas capturadas por TÚ: peón/)).toBeInTheDocument();
    expect(screen.queryByLabelText(/Piezas capturadas por BOT/)).not.toBeInTheDocument();
  });

  it('indica que el bot está pensando durante su turno', () => {
    const game = gameWithHistory(); // el turno pasa a las negras tras la primera jugada
    renderGameScreen({ game, botMode: true });
    expect(screen.getByText('El bot está pensando…')).toBeInTheDocument();
  });

  it('muestra el modal de fin de partida y notifica el ganador', () => {
    const onGameOver = vi.fn();
    const game = { ...createGame(), over: true, winner: WHITE, endReason: 'checkmate' };
    renderGameScreen({ game, onGameOver, botMode: true });
    expect(screen.getByText('¡Ganaste!')).toBeInTheDocument();
    expect(onGameOver).toHaveBeenCalledWith(WHITE);
  });

  it('notifica el ganador una sola vez aunque el padre se vuelva a renderizar', () => {
    const onGameOver = vi.fn();
    const game = { ...createGame(), over: true, winner: WHITE, endReason: 'checkmate' };
    // El callback cambia de identidad en cada render del padre (como ocurre al
    // actualizar el marcador): la notificación debe emitirse una única vez
    const newDelegate = () => () => onGameOver(WHITE);
    const props = {
      game,
      onMove: vi.fn(),
      onUndo: vi.fn(),
      onRestart: vi.fn(),
      onMenu: vi.fn(),
      player1Name: 'TÚ',
      player2Name: 'BOT',
      botMode: true,
    };
    const { rerender } = render(<GameScreen {...props} onGameOver={newDelegate()} />);
    rerender(<GameScreen {...props} onGameOver={newDelegate()} />);
    rerender(<GameScreen {...props} onGameOver={newDelegate()} />);
    expect(onGameOver).toHaveBeenCalledTimes(1);
  });

  it('no muestra el botón de reiniciar el marcador', () => {
    renderGameScreen();
    expect(screen.queryByLabelText('Reiniciar marcador')).not.toBeInTheDocument();
  });
});
