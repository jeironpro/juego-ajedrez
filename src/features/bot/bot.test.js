import { describe, it, expect } from 'vitest';
import { chooseMove } from './bot.js';
import { DIFFICULTY_DEPTHS, DIFFICULTIES } from './difficulty.js';
import { evaluateBoard, evaluateSide } from './evaluation.js';
import { createGame, applyMove } from '@/features/game/game.js';
import { getLegalMoves, moveKey } from '@/features/game/moves.js';
import { applyMoveToBoard } from '@/features/game/apply.js';
import { createEmptyBoard, createPiece } from '@/features/game/board.js';
import { WHITE, BLACK, PIECE_TYPES } from '@/features/game/constants.js';

// Aplica la secuencia de jugadas indicada (notación e2e4) sobre una partida nueva
function playSequence(notationList) {
  let game = createGame();
  for (const notation of notationList) {
    const moves = getLegalMoves(game.board, game.turn, {
      castlingRights: game.castlingRights,
      enPassantTarget: game.enPassantTarget,
      applyMoveToBoardFn: applyMoveToBoard,
    });
    const move = moves.find((candidate) => moveKey(candidate) === notation);
    if (move === undefined) throw new Error(`Movimiento no encontrado: ${notation}`);
    game = applyMove(game, move);
  }
  return game;
}

// Verifica que el movimiento devuelto pertenece a los legales del turno
function isAmongLegalMoves(game, move) {
  const legal = getLegalMoves(game.board, game.turn, {
    castlingRights: game.castlingRights,
    enPassantTarget: game.enPassantTarget,
    applyMoveToBoardFn: applyMoveToBoard,
  });
  return legal.some(
    (candidate) =>
      candidate.from.row === move.from.row &&
      candidate.from.col === move.from.col &&
      candidate.to.row === move.to.row &&
      candidate.to.col === move.to.col,
  );
}

// Construye una partida con un tablero sintético y el turno indicado
function gameWithBoard(boardPieces, turn = WHITE) {
  const game = createGame();
  const board = createEmptyBoard();
  for (const [type, color, row, col] of boardPieces) {
    board[row][col] = createPiece(type, color);
  }
  game.board = board;
  game.turn = turn;
  game.castlingRights = {
    [WHITE]: { kingSide: false, queenSide: false },
    [BLACK]: { kingSide: false, queenSide: false },
  };
  return game;
}

describe('difficulty', () => {
  it('define profundidad creciente por nivel', () => {
    expect(DIFFICULTY_DEPTHS.facil).toBeLessThan(DIFFICULTY_DEPTHS.medio);
    expect(DIFFICULTY_DEPTHS.medio).toBeLessThan(DIFFICULTY_DEPTHS.dificil);
  });

  it('expone las tres dificultades con etiquetas', () => {
    expect(DIFFICULTIES).toHaveLength(3);
  });
});

describe('evaluation', () => {
  it('valora más un bando con más material', () => {
    const board = createEmptyBoard();
    board[7][0] = createPiece(PIECE_TYPES.KING, WHITE);
    board[7][1] = createPiece(PIECE_TYPES.QUEEN, WHITE);
    board[0][7] = createPiece(PIECE_TYPES.KING, BLACK);
    expect(evaluateBoard(board, WHITE)).toBeGreaterThan(0);
    expect(evaluateBoard(board, BLACK)).toBeLessThan(0);
  });

  it('es simétrica: el tablero inicial vale cero para ambos bandos', () => {
    const game = createGame();
    expect(evaluateBoard(game.board, WHITE)).toBe(0);
    expect(evaluateBoard(game.board, BLACK)).toBe(0);
    // Ambos bandos suman exactamente lo mismo en la posición inicial espejada
    expect(evaluateSide(game.board, WHITE)).toBe(evaluateSide(game.board, BLACK));
  });
});

describe('chooseMove', () => {
  it('siempre devuelve un movimiento legal del turno', () => {
    const game = createGame();
    const move = chooseMove(game, 'medio');
    expect(isAmongLegalMoves(game, move)).toBe(true);
  });

  it('devuelve null cuando no hay movimientos', () => {
    // Ahogado clásico: rey blanco en a1 rodeado por la dama negra en c2 (su rey en d2)
    const game = gameWithBoard(
      [
        [PIECE_TYPES.KING, WHITE, 7, 0],
        [PIECE_TYPES.QUEEN, BLACK, 6, 2],
        [PIECE_TYPES.KING, BLACK, 6, 3],
      ],
      WHITE,
    );
    expect(chooseMove(game, 'dificil')).toBeNull();
  });

  it('con mate en una jugada disponible, lo elige (nivel difícil)', () => {
    // Mate del pastor: tras 3...Cf6 el blanco remata con Qxf7#
    let game = playSequence(['e2e4', 'e7e5', 'f1c4', 'b8c6', 'd1h5', 'g8f6']);
    const move = chooseMove(game, 'dificil');
    expect(move.to).toEqual({ row: 1, col: 5 }); // Qxf7#
  });

  it('encuentra el mate en una jugada con nivel medio', () => {
    let game = playSequence(['f2f3', 'e7e5', 'g2g4']);
    const move = chooseMove(game, 'medio');
    expect(move.to).toEqual({ row: 4, col: 7 }); // Qh4#
  });

  it('el nivel fácil es determinista con semilla fija', () => {
    const game = createGame();
    const seededRandom = () => 0.9;
    const first = chooseMove(game, 'facil', seededRandom);
    const second = chooseMove(game, 'facil', seededRandom);
    expect(first.from).toEqual(second.from);
    expect(first.to).toEqual(second.to);
  });

  it('prefiere capturar la dama antes que el peón (nivel medio)', () => {
    const game = gameWithBoard(
      [
        [PIECE_TYPES.KING, WHITE, 7, 0],
        [PIECE_TYPES.ROOK, WHITE, 4, 4],
        [PIECE_TYPES.KING, BLACK, 0, 7],
        [PIECE_TYPES.QUEEN, BLACK, 3, 4],
        [PIECE_TYPES.PAWN, BLACK, 6, 5],
      ],
      WHITE,
    );
    const move = chooseMove(game, 'medio');
    expect(move.to).toEqual({ row: 3, col: 4 });
  });

  it('el bot a nivel difícil responde con una jugada legal en cualquier posición', () => {
    let game = playSequence(['d2d4', 'd7d5', 'b1c3', 'b8c6', 'g1f3', 'g8f6']);
    const move = chooseMove(game, 'dificil');
    expect(isAmongLegalMoves(game, move)).toBe(true);
  });

  it('escapa del mate en una jugada si existe defensa (nivel difícil)', () => {
    // Tras 1.e4 e5 2.Ac4 Cc6 3.Dh5 el negro está amenazado con Qxf7#
    let game = playSequence(['e2e4', 'e7e5', 'f1c4', 'b8c6', 'd1h5']);
    const move = chooseMove(game, 'dificil');
    expect(isAmongLegalMoves(game, move)).toBe(true);
    // Tras la defensa elegida, el blanco ya no tiene mate inmediato en una jugada
    const defended = applyMove(game, move);
    const whiteReplies = getLegalMoves(defended.board, defended.turn, {
      castlingRights: defended.castlingRights,
      enPassantTarget: defended.enPassantTarget,
      applyMoveToBoardFn: applyMoveToBoard,
    });
    const mates = whiteReplies.filter(
      (reply) => applyMove(defended, reply).endReason === 'checkmate',
    );
    expect(mates).toHaveLength(0);
  });
});
