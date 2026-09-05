import { describe, it, expect } from 'vitest';
import { createGame, applyMove, undoMove, positionKey, detectGameEnd } from './game.js';
import { getLegalMoves } from './moves.js';
import { applyMoveToBoard } from './apply.js';
import { createEmptyBoard, createPiece } from './board.js';
import { WHITE, BLACK, PIECE_TYPES, GAME_END_REASONS } from './constants.js';
import { findMove, play } from '@/test/game-helpers.js';

describe('estado inicial', () => {
  it('arranca con el blanco al mover y sin historial', () => {
    const game = createGame();
    expect(game.turn).toBe(WHITE);
    expect(game.history).toHaveLength(0);
    expect(game.over).toBe(false);
    expect(game.winner).toBeNull();
    expect(game.undoUsed).toBe(false);
    expect(game.lastMove).toBeNull();
  });

  it('la clave de posición inicial es estable', () => {
    const game = createGame();
    expect(positionKey(game.board, game.turn)).toBe(positionKey(createGame().board, WHITE));
  });
});

describe('jugadas básicas', () => {
  it('aplica 1. e4 y actualiza turno, historial y objetivo al paso', () => {
    const game = play(createGame(), 'e2e4');
    expect(game.turn).toBe(BLACK);
    expect(game.history).toHaveLength(1);
    expect(game.enPassantTarget).toEqual({ row: 5, col: 4 });
    expect(game.lastMove.notation).toBe('e2e4');
    expect(game.fullmoveNumber).toBe(1);
  });

  it('el número de jugada avanza tras mover las negras', () => {
    let game = play(createGame(), 'e2e4');
    game = play(game, 'e7e5');
    expect(game.fullmoveNumber).toBe(2);
  });

  it('el reloj de 50 movimientos se reinicia con un peón y crece con las piezas', () => {
    let game = play(createGame(), 'g1f3');
    expect(game.halfmoveClock).toBe(1);
    game = play(game, 'e7e5');
    expect(game.halfmoveClock).toBe(0);
  });

  it('rechaza una jugada ilegal', () => {
    const game = createGame();
    const illegal = { from: { row: 7, col: 4 }, to: { row: 5, col: 4 } };
    expect(() => applyMove(game, illegal)).toThrow();
  });

  it('rechaza mover una pieza rival', () => {
    const game = createGame();
    const rivalMove = { from: { row: 1, col: 4 }, to: { row: 2, col: 4 } };
    expect(() => applyMove(game, rivalMove)).toThrow();
  });
});

describe('enroque', () => {
  it('el blanco puede enrocar corto tras abrir centro y alfil de rey', () => {
    let game = play(createGame(), 'e2e4');
    game = play(game, 'e7e5');
    game = play(game, 'g1f3');
    game = play(game, 'b8c6');
    game = play(game, 'f1c4');
    game = play(game, 'g8f6');
    const castling = findMove(game, 'e1g1');
    expect(castling).toBeDefined();
    expect(castling.isCastling).toBe('kingSide');
    game = applyMove(game, castling);
    // Rey en g1 y torre en f1
    expect(game.board[7][6]).toEqual({ type: 'king', color: WHITE });
    expect(game.board[7][5]).toEqual({ type: 'rook', color: WHITE });
    expect(game.lastMove.isCastling).toBe('kingSide');
  });

  it('pierde el derecho a enrocar corto si la torre se mueve', () => {
    let game = play(createGame(), 'g1f3');
    game = play(game, 'e7e5');
    game = play(game, 'h2h3');
    game = play(game, 'b8c6');
    game = play(game, 'h1g1');
    game = play(game, 'g8f6');
    expect(findMove(game, 'e1g1')).toBeUndefined();
  });

  it('no se puede enrocar si el rey debe atravesar una casilla atacada', () => {
    let game = play(createGame(), 'f2f3');
    game = play(game, 'e7e5');
    game = play(game, 'g2g4');
    // La dama negra da jaque por la diagonal h4-e1; el enroque no es legal ahora
    game = play(game, 'd8h4');
    expect(findMove(game, 'e1g1')).toBeUndefined();
  });
});

describe('captura al paso', () => {
  it('permite capturar al paso justo tras el avance doble', () => {
    let game = play(createGame(), 'e2e4');
    game = play(game, 'a7a6');
    game = play(game, 'e4e5');
    game = play(game, 'd7d5');
    const enPassant = findMove(game, 'e5d6');
    expect(enPassant).toBeDefined();
    expect(enPassant.isEnPassant).toBe(true);
    game = applyMove(game, enPassant);
    // El peón negro de d5 desaparece y el blanco queda en d6
    expect(game.board[3][3]).toBeNull();
    expect(game.board[2][3]).toEqual({ type: 'pawn', color: WHITE });
  });

  it('la captura al paso caduca tras una jugada', () => {
    let game = play(createGame(), 'e2e4');
    game = play(game, 'a7a6');
    game = play(game, 'e4e5');
    game = play(game, 'd7d5');
    game = play(game, 'a2a3');
    expect(findMove(game, 'e5d6')).toBeUndefined();
  });
});

describe('coronación', () => {
  it('corona a dama al alcanzar la última fila', () => {
    let game = createGame();
    // El peón de a captura el peón de b, avanza y corona capturando la torre de a8
    const sequence = ['a2a4', 'b7b5', 'a4b5', 'a7a6', 'b5b6', 'h7h6', 'b6b7', 'h6h5', 'b7a8=Q'];
    for (const notation of sequence) {
      game = play(game, notation);
    }
    expect(game.board[0][0]).toEqual({ type: 'queen', color: WHITE });
    expect(game.lastMove.notation).toBe('b7a8=Q');
  });

  it('el peón bloqueado en la penúltima fila no puede coronar', () => {
    const game = createGame();
    const board = createEmptyBoard();
    board[7][7] = createPiece(PIECE_TYPES.KING, WHITE);
    board[1][1] = createPiece(PIECE_TYPES.PAWN, WHITE);
    board[0][1] = createPiece(PIECE_TYPES.ROOK, BLACK);
    board[3][3] = createPiece(PIECE_TYPES.KING, BLACK);
    game.board = board;
    game.castlingRights = {
      [WHITE]: { kingSide: false, queenSide: false },
      [BLACK]: { kingSide: false, queenSide: false },
    };
    const moves = getLegalMoves(game.board, game.turn, {
      castlingRights: game.castlingRights,
      enPassantTarget: game.enPassantTarget,
      applyMoveToBoardFn: applyMoveToBoard,
    });
    // b8 está ocupada por la torre: el peón no tiene avance ni capturas
    const pawnMoves = moves.filter((move) => move.piece === PIECE_TYPES.PAWN);
    expect(pawnMoves).toHaveLength(0);
  });
});

describe('fin de partida', () => {
  it('detecta el mate del pastor', () => {
    let game = play(createGame(), 'e2e4');
    game = play(game, 'e7e5');
    game = play(game, 'f1c4');
    game = play(game, 'b8c6');
    game = play(game, 'd1h5');
    game = play(game, 'g8f6');
    game = play(game, 'h5f7');
    expect(game.over).toBe(true);
    expect(game.winner).toBe(WHITE);
    expect(game.endReason).toBe(GAME_END_REASONS.CHECKMATE);
  });

  it('detecta el ahogado en una posición sintética', () => {
    // Rey negro en h8 rodeado: dama g2 cubre la columna g y torre e7 cubre la séptima fila
    const game = createGame();
    const board = createEmptyBoard();
    board[0][7] = createPiece(PIECE_TYPES.KING, BLACK);
    board[6][6] = createPiece(PIECE_TYPES.QUEEN, WHITE);
    board[1][4] = createPiece(PIECE_TYPES.ROOK, WHITE);
    board[4][3] = createPiece(PIECE_TYPES.KING, WHITE);
    game.board = board;
    game.turn = BLACK;
    game.castlingRights = {
      [WHITE]: { kingSide: false, queenSide: false },
      [BLACK]: { kingSide: false, queenSide: false },
    };
    const end = detectGameEnd(game);
    expect(end).toEqual({ winner: null, reason: GAME_END_REASONS.STALEMATE });
  });

  it('detecta tablas por material insuficiente', () => {
    const game = createGame();
    const board = createEmptyBoard();
    board[7][0] = createPiece(PIECE_TYPES.KING, WHITE);
    board[0][7] = createPiece(PIECE_TYPES.KING, BLACK);
    game.board = board;
    game.turn = WHITE;
    const end = detectGameEnd(game);
    expect(end).toEqual({ winner: null, reason: GAME_END_REASONS.INSUFFICIENT_MATERIAL });
  });

  it('no da la partida por terminada al inicio', () => {
    const game = createGame();
    expect(detectGameEnd(game)).toBeNull();
  });
});

describe('deshacer', () => {
  it('restaura el estado completo de la jugada anterior una vez', () => {
    let game = play(createGame(), 'e2e4');
    game = play(game, 'e7e5');
    const beforeUndo = game;
    const undone = undoMove(game);
    expect(undone.turn).toBe(BLACK);
    expect(undone.board).toEqual(beforeUndo.history[beforeUndo.history.length - 1].board);
    expect(undone.undoUsed).toBe(true);
    // El historial restaurado contiene las jugadas anteriores a la deshecha
    expect(undone.history).toHaveLength(1);
  });

  it('solo se puede deshacer una vez por partida', () => {
    let game = play(createGame(), 'e2e4');
    game = play(game, 'e7e5');
    const undone = undoMove(game);
    const undoneAgain = undoMove(undone);
    expect(undoneAgain).toBe(undone);
  });

  it('no hace nada sin historial', () => {
    const game = createGame();
    expect(undoMove(game)).toBe(game);
  });

  it('restaura el turno y los derechos de enroque previos', () => {
    let game = play(createGame(), 'g1f3');
    const undone = undoMove(game);
    expect(undone.turn).toBe(WHITE);
    expect(undone.castlingRights[WHITE].kingSide).toBe(true);
    expect(undone.castlingRights[WHITE].queenSide).toBe(true);
  });
});

describe('capturas registradas', () => {
  it('registra la pieza comida con su color en jugadas tranquilas y capturas', () => {
    let game = play(createGame(), 'e2e4');
    expect(game.capturedPieces).toHaveLength(0);

    // 1. e4 d5 2. exd5: el blanco come un peón negro
    game = play(game, 'd7d5');
    game = play(game, 'e4d5');
    expect(game.capturedPieces).toEqual([{ type: PIECE_TYPES.PAWN, color: BLACK }]);

    // 2... Dxd5: la dama negra come el peón blanco
    game = play(game, 'd8d5');
    expect(game.capturedPieces).toEqual([
      { type: PIECE_TYPES.PAWN, color: BLACK },
      { type: PIECE_TYPES.PAWN, color: WHITE },
    ]);
  });

  it('registra la captura al paso como un peón comido', () => {
    let game = play(createGame(), 'e2e4');
    game = play(game, 'a7a6');
    game = play(game, 'e4e5');
    game = play(game, 'd7d5');
    game = play(game, 'e5d6');
    expect(game.capturedPieces).toEqual([{ type: PIECE_TYPES.PAWN, color: BLACK }]);
  });

  it('al deshacer una captura se restaura la lista de piezas comidas', () => {
    let game = play(createGame(), 'e2e4');
    game = play(game, 'd7d5');
    game = play(game, 'e4d5');
    expect(game.capturedPieces).toHaveLength(1);
    const undone = undoMove(game);
    expect(undone.capturedPieces).toHaveLength(0);
  });
});
