import { describe, it, expect } from 'vitest';
import { hasInsufficientMaterial } from './endgame.js';
import { createEmptyBoard, createPiece } from './board.js';
import { WHITE, BLACK, PIECE_TYPES } from './constants.js';

describe('hasInsufficientMaterial', () => {
  it('rey contra rey es material insuficiente', () => {
    const board = createEmptyBoard();
    board[7][0] = createPiece(PIECE_TYPES.KING, WHITE);
    board[0][7] = createPiece(PIECE_TYPES.KING, BLACK);
    expect(hasInsufficientMaterial(board)).toBe(true);
  });

  it('rey y alfil contra rey es material insuficiente', () => {
    const board = createEmptyBoard();
    board[7][0] = createPiece(PIECE_TYPES.KING, WHITE);
    board[7][1] = createPiece(PIECE_TYPES.BISHOP, WHITE);
    board[0][7] = createPiece(PIECE_TYPES.KING, BLACK);
    expect(hasInsufficientMaterial(board)).toBe(true);
  });

  it('un peón garantiza material suficiente', () => {
    const board = createEmptyBoard();
    board[7][0] = createPiece(PIECE_TYPES.KING, WHITE);
    board[0][7] = createPiece(PIECE_TYPES.KING, BLACK);
    board[4][4] = createPiece(PIECE_TYPES.PAWN, WHITE);
    expect(hasInsufficientMaterial(board)).toBe(false);
  });

  it('dos piezas menores del mismo bando pueden dar mate', () => {
    const board = createEmptyBoard();
    board[7][0] = createPiece(PIECE_TYPES.KING, WHITE);
    board[7][1] = createPiece(PIECE_TYPES.BISHOP, WHITE);
    board[7][2] = createPiece(PIECE_TYPES.KNIGHT, WHITE);
    board[0][7] = createPiece(PIECE_TYPES.KING, BLACK);
    expect(hasInsufficientMaterial(board)).toBe(false);
  });
});
