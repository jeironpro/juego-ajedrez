import { describe, it, expect } from 'vitest';
import { getMaterialScore, hasInsufficientMaterial, evaluateGameEnd } from './endgame.js';
import { createEmptyBoard, createPiece } from './board.js';
import { WHITE, BLACK, PIECE_TYPES, GAME_END_REASONS } from './constants.js';

describe('getMaterialScore', () => {
  it('suma el valor material de las piezas de un bando', () => {
    const board = createEmptyBoard();
    board[0][0] = createPiece(PIECE_TYPES.QUEEN, WHITE);
    board[1][0] = createPiece(PIECE_TYPES.PAWN, WHITE);
    board[7][7] = createPiece(PIECE_TYPES.ROOK, BLACK);
    expect(getMaterialScore(board, WHITE)).toBe(1000);
    expect(getMaterialScore(board, BLACK)).toBe(500);
  });
});

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

describe('evaluateGameEnd', () => {
  it('puntúa la victoria, la derrota y las tablas', () => {
    const base = { over: false, winner: null };
    expect(evaluateGameEnd(base, WHITE)).toBeNull();
    expect(evaluateGameEnd({ ...base, over: true, winner: WHITE }, WHITE)).toBeGreaterThan(0);
    expect(evaluateGameEnd({ ...base, over: true, winner: WHITE }, BLACK)).toBeLessThan(0);
    expect(
      evaluateGameEnd(
        { ...base, over: true, winner: null, endReason: GAME_END_REASONS.STALEMATE },
        WHITE,
      ),
    ).toBe(0);
  });
});
