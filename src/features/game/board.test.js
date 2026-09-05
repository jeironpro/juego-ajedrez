import { describe, it, expect } from 'vitest';
import {
  createEmptyBoard,
  createInitialBoard,
  toAlgebraic,
  fromAlgebraic,
  countPieces,
  switchPlayer,
  createPiece,
} from './board.js';
import { WHITE, BLACK, PIECE_TYPES } from './constants.js';

describe('board', () => {
  it('crea un tablero vacío de 8x8', () => {
    const board = createEmptyBoard();
    expect(board).toHaveLength(8);
    expect(board.every((row) => row.length === 8 && row.every((cell) => cell === null))).toBe(true);
  });

  it('crea la posición inicial con 16 piezas por bando', () => {
    const board = createInitialBoard();
    expect(countPieces(board, WHITE)).toBe(16);
    expect(countPieces(board, BLACK)).toBe(16);
    expect(board[0][0]).toEqual(createPiece(PIECE_TYPES.ROOK, BLACK));
    expect(board[0][3]).toEqual(createPiece(PIECE_TYPES.QUEEN, BLACK));
    expect(board[7][4]).toEqual(createPiece(PIECE_TYPES.KING, WHITE));
    expect(board[1][0]).toEqual(createPiece(PIECE_TYPES.PAWN, BLACK));
    expect(board[6][7]).toEqual(createPiece(PIECE_TYPES.PAWN, WHITE));
  });

  it('convierte coordenadas a notación algebraica y viceversa', () => {
    expect(toAlgebraic(7, 4)).toBe('e1');
    expect(toAlgebraic(0, 0)).toBe('a8');
    expect(fromAlgebraic('e1')).toEqual({ row: 7, col: 4 });
    expect(fromAlgebraic('a8')).toEqual({ row: 0, col: 0 });
    expect(fromAlgebraic(toAlgebraic(3, 5))).toEqual({ row: 3, col: 5 });
  });

  it('alterna el bando al cambiar de turno', () => {
    expect(switchPlayer(WHITE)).toBe(BLACK);
    expect(switchPlayer(BLACK)).toBe(WHITE);
  });
});
