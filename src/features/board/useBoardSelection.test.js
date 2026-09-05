import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useBoardSelection } from './useBoardSelection.js';
import { createInitialBoard } from '@/features/game/board.js';
import { getLegalMoves } from '@/features/game/moves.js';
import { applyMoveToBoard } from '@/features/game/apply.js';
import { WHITE } from '@/features/game/constants.js';

// Tablero inicial y movimientos legales reales del motor
function setup() {
  const board = createInitialBoard();
  const turn = WHITE;
  const legalMoves = getLegalMoves(board, turn, { applyMoveToBoardFn: applyMoveToBoard });
  const onMove = vi.fn();
  const { result } = renderHook(() =>
    useBoardSelection({ board, turn, legalMoves, disabled: false, onMove }),
  );
  return { result, board, legalMoves, onMove };
}

describe('useBoardSelection', () => {
  it('selecciona una pieza propia al pulsarla', () => {
    const { result, board } = setup();
    // Peón blanco de e2 (fila 6, columna 4)
    expect(board[6][4]).not.toBeNull();
    act(() => result.current.handleSquareClick(6, 4));
    expect(result.current.selection).toEqual({ row: 6, col: 4 });
  });

  it('ejecuta la jugada al pulsar un destino legal de la pieza seleccionada', () => {
    const { result, onMove } = setup();
    act(() => result.current.handleSquareClick(6, 4)); // selecciona el peón e2
    act(() => result.current.handleSquareClick(4, 4)); // avanza a e4
    expect(onMove).toHaveBeenCalledTimes(1);
    expect(onMove.mock.calls[0][0].from).toEqual({ row: 6, col: 4 });
    expect(onMove.mock.calls[0][0].to).toEqual({ row: 4, col: 4 });
    expect(result.current.selection).toBeNull();
  });

  it('cambia de selección al pulsar otra pieza propia', () => {
    const { result } = setup();
    act(() => result.current.handleSquareClick(6, 4)); // peón e2
    act(() => result.current.handleSquareClick(7, 1)); // caballo b1
    expect(result.current.selection).toEqual({ row: 7, col: 1 });
  });

  it('limpia la selección al pulsar una casilla que no es destino', () => {
    const { result } = setup();
    act(() => result.current.handleSquareClick(6, 4)); // peón e2
    act(() => result.current.handleSquareClick(5, 3)); // d3 vacío y no es destino del peón
    expect(result.current.selection).toBeNull();
  });

  it('ignora los clics cuando el tablero está deshabilitado', () => {
    const board = createInitialBoard();
    const turn = WHITE;
    const legalMoves = [];
    const onMove = vi.fn();
    const { result } = renderHook(() =>
      useBoardSelection({ board, turn, legalMoves, disabled: true, onMove }),
    );
    act(() => result.current.handleSquareClick(6, 4));
    expect(result.current.selection).toBeNull();
    expect(onMove).not.toHaveBeenCalled();
  });
});
