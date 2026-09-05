import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createGame } from '@/features/game/game.js';
import { WHITE } from '@/features/game/constants.js';
import { play } from '@/test/game-helpers.js';
import GameScreen from './GameScreen.jsx';

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

  it('arranca con 16 piezas por jugador', () => {
    renderGameScreen();
    expect(screen.getAllByText('16')).toHaveLength(2);
  });

  it('descuenta piezas al bando que pierde una captura', () => {
    renderGameScreen({ game: gameWithCapture() });
    // Las blancas comieron un peón negro: TÚ sigue con 16 y BOT baja a 15
    expect(screen.getByText('16')).toBeInTheDocument();
    expect(screen.getByText('15')).toBeInTheDocument();
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

  it('muestra el modal de fin de partida con el ganador', () => {
    const game = { ...createGame(), over: true, winner: WHITE, endReason: 'checkmate' };
    renderGameScreen({ game, botMode: true });
    expect(screen.getByText('¡Ganaste!')).toBeInTheDocument();
  });

  it('no muestra el botón de reiniciar el marcador', () => {
    renderGameScreen();
    expect(screen.queryByLabelText('Reiniciar marcador')).not.toBeInTheDocument();
  });
});
