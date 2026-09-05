import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createInitialBoard } from '@/features/game/board.js';
import { WHITE, BLACK } from '@/features/game/constants.js';
import Chessboard from './Chessboard.jsx';

describe('Chessboard', () => {
  it('dibuja las 64 casillas con sus piezas iniciales', () => {
    render(<Chessboard board={createInitialBoard()} turn={WHITE} onMove={vi.fn()} />);
    expect(screen.getByLabelText('Tablero de ajedrez')).toBeInTheDocument();
    expect(screen.getAllByRole('button')).toHaveLength(64);
    expect(screen.getByRole('button', { name: 'e2, peón blanco' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'e7, peón negro' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'e1, rey blanco' })).toBeInTheDocument();
  });

  it('selecciona una pieza propia y ejecuta la jugada al pulsar el destino', async () => {
    const user = userEvent.setup();
    const onMove = vi.fn();
    render(<Chessboard board={createInitialBoard()} turn={WHITE} onMove={onMove} />);

    const from = screen.getByRole('button', { name: /^e2/ });
    await user.click(from);
    expect(from).toHaveAttribute('aria-pressed', 'true');

    await user.click(screen.getByRole('button', { name: 'e4' }));
    expect(onMove).toHaveBeenCalledTimes(1);
    const move = onMove.mock.calls[0][0];
    expect(move.from).toEqual({ row: 6, col: 4 });
    expect(move.to).toEqual({ row: 4, col: 4 });
  });

  it('no deja mover una pieza rival en el turno del blanco', async () => {
    const user = userEvent.setup();
    const onMove = vi.fn();
    render(<Chessboard board={createInitialBoard()} turn={WHITE} onMove={onMove} />);

    await user.click(screen.getByRole('button', { name: /^e7/ }));
    await user.click(screen.getByRole('button', { name: 'e5' }));
    expect(onMove).not.toHaveBeenCalled();
  });

  it('bloquea todas las casillas cuando el tablero está deshabilitado', () => {
    render(<Chessboard board={createInitialBoard()} turn={BLACK} disabled onMove={vi.fn()} />);
    expect(screen.getAllByRole('button')).toHaveLength(64);
    screen.getAllByRole('button').forEach((square) => {
      expect(square).toBeDisabled();
    });
  });
});
