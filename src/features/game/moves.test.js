import { describe, it, expect } from 'vitest';
import { createEmptyBoard, createPiece, createInitialBoard } from './board.js';
import { getLegalMoves, isSquareAttacked, isInCheck, moveToNotation } from './moves.js';
import { applyMoveToBoard } from './apply.js';
import { WHITE, BLACK, PIECE_TYPES, BOARD_SIZE } from './constants.js';

// Coloca una pieza en un tablero vacío
function boardWith(type, color, row, col) {
  const board = createEmptyBoard();
  board[row][col] = createPiece(type, color);
  return board;
}

describe('generación de movimientos por pieza', () => {
  it('el caballo salta en L desde el centro', () => {
    const board = boardWith(PIECE_TYPES.KNIGHT, WHITE, 4, 4);
    const moves = getLegalMoves(board, WHITE, { applyMoveToBoardFn: applyMoveToBoard });
    expect(moves).toHaveLength(8);
  });

  it('el caballo en esquina solo tiene dos saltos', () => {
    const board = boardWith(PIECE_TYPES.KNIGHT, WHITE, 7, 0);
    const moves = getLegalMoves(board, WHITE, { applyMoveToBoardFn: applyMoveToBoard });
    expect(moves).toHaveLength(2);
  });

  it('la torre se desliza y se detiene ante una pieza propia', () => {
    const board = boardWith(PIECE_TYPES.ROOK, WHITE, 4, 4);
    board[4][6] = createPiece(PIECE_TYPES.PAWN, WHITE);
    board[2][4] = createPiece(PIECE_TYPES.PAWN, BLACK);
    const moves = getLegalMoves(board, WHITE, { applyMoveToBoardFn: applyMoveToBoard });
    // 4 a la izquierda + 1 a la derecha + 2 arriba (captura incluida) + 4 abajo
    expect(moves).toHaveLength(11);
    const destinations = moves.map((move) => moveToNotation(move));
    expect(destinations).toContain('e4e6'); // captura del peón negro en e6
    expect(destinations).not.toContain('e4e7'); // por detrás del peón capturado
    expect(destinations).not.toContain('e4g4'); // detrás de la pieza propia
  });

  it('el alfil solo se mueve en diagonal', () => {
    const board = boardWith(PIECE_TYPES.BISHOP, WHITE, 4, 4);
    const moves = getLegalMoves(board, WHITE, { applyMoveToBoardFn: applyMoveToBoard });
    // 3 + 4 + 3 + 3 casillas en las cuatro diagonales
    expect(moves).toHaveLength(13);
  });

  it('la dama combina torre y alfil', () => {
    const board = boardWith(PIECE_TYPES.QUEEN, WHITE, 4, 4);
    const moves = getLegalMoves(board, WHITE, { applyMoveToBoardFn: applyMoveToBoard });
    expect(moves).toHaveLength(27);
  });

  it('el rey se mueve una casilla en cualquier dirección', () => {
    const board = boardWith(PIECE_TYPES.KING, WHITE, 4, 4);
    const moves = getLegalMoves(board, WHITE, { applyMoveToBoardFn: applyMoveToBoard });
    expect(moves).toHaveLength(8);
  });

  it('el peón avanza una o dos casillas desde la posición inicial', () => {
    const board = boardWith(PIECE_TYPES.PAWN, WHITE, 6, 4);
    const moves = getLegalMoves(board, WHITE, { applyMoveToBoardFn: applyMoveToBoard });
    expect(moves.map(moveToNotation).sort()).toEqual(['e2e3', 'e2e4']);
  });

  it('el peón no puede avanzar si la casilla está ocupada', () => {
    const board = boardWith(PIECE_TYPES.PAWN, WHITE, 6, 4);
    board[5][4] = createPiece(PIECE_TYPES.PAWN, BLACK);
    const moves = getLegalMoves(board, WHITE, { applyMoveToBoardFn: applyMoveToBoard });
    expect(moves).toHaveLength(0);
  });

  it('el peón captura en diagonal solo piezas rivales', () => {
    const board = boardWith(PIECE_TYPES.PAWN, WHITE, 4, 4);
    board[3][3] = createPiece(PIECE_TYPES.PAWN, BLACK);
    board[3][5] = createPiece(PIECE_TYPES.PAWN, WHITE);
    const moves = getLegalMoves(board, WHITE, { applyMoveToBoardFn: applyMoveToBoard });
    const pawnMoves = moves.filter((move) => move.from.col === 4);
    expect(pawnMoves.map(moveToNotation).sort()).toEqual(['e4d5', 'e4e5']);
  });
});

describe('posiciones con estado', () => {
  it('la posición inicial tiene 20 movimientos legales', () => {
    const board = createInitialBoard();
    const moves = getLegalMoves(board, WHITE, { applyMoveToBoardFn: applyMoveToBoard });
    expect(moves).toHaveLength(20);
  });

  it('un peón en séptima genera cuatro coronaciones', () => {
    const board = boardWith(PIECE_TYPES.PAWN, WHITE, 1, 4);
    const moves = getLegalMoves(board, WHITE, { applyMoveToBoardFn: applyMoveToBoard });
    const promotions = moves.filter((move) => move.to.row === 0);
    expect(promotions).toHaveLength(4);
    expect(promotions.map((move) => move.promotion).sort()).toEqual([
      'bishop',
      'knight',
      'queen',
      'rook',
    ]);
  });
});

describe('jaque y detección de ataques', () => {
  it('detecta que una casilla está atacada por una torre', () => {
    const board = boardWith(PIECE_TYPES.ROOK, BLACK, 0, 4);
    expect(isSquareAttacked(board, 4, 4, BLACK)).toBe(true);
    expect(isSquareAttacked(board, 4, 5, BLACK)).toBe(false);
  });

  it('detecta el jaque al rey desde el otro extremo del tablero', () => {
    const board = boardWith(PIECE_TYPES.KING, WHITE, 7, 4);
    board[0][4] = createPiece(PIECE_TYPES.ROOK, BLACK);
    expect(isInCheck(board, WHITE)).toBe(true);
  });

  it('un peón no ataca hacia delante, solo en diagonal', () => {
    const board = boardWith(PIECE_TYPES.PAWN, BLACK, 3, 4);
    expect(isSquareAttacked(board, 4, 4, BLACK)).toBe(false);
    expect(isSquareAttacked(board, 4, 3, BLACK)).toBe(true);
    expect(isSquareAttacked(board, 4, 5, BLACK)).toBe(true);
  });

  it('un alfil ataca a través de sus diagonales completas', () => {
    const board = boardWith(PIECE_TYPES.KING, WHITE, 7, 0);
    board[6][1] = createPiece(PIECE_TYPES.PAWN, WHITE);
    board[4][3] = createPiece(PIECE_TYPES.BISHOP, BLACK);
    // d5-f4-g3-h2 no toca g1... el alfil en d5 ataca b3, c4, e4... no g1
    expect(isInCheck(board, WHITE)).toBe(false);
    board[3][4] = createPiece(PIECE_TYPES.BISHOP, BLACK);
    // e5-f4-g3-h2 sí ataca h1? no: el rey está en a1; el alfil en e5 no llega a a1
    expect(isInCheck(board, WHITE)).toBe(false);
  });
});

describe('restricciones de legalidad', () => {
  it('una pieza clavada solo puede moverse por la línea del clavado', () => {
    const board = boardWith(PIECE_TYPES.KING, WHITE, 7, 4);
    board[6][4] = createPiece(PIECE_TYPES.ROOK, WHITE);
    board[0][4] = createPiece(PIECE_TYPES.ROOK, BLACK);
    const moves = getLegalMoves(board, WHITE, { applyMoveToBoardFn: applyMoveToBoard });
    const rookMoves = moves.filter((move) => move.piece === PIECE_TYPES.ROOK);
    // La torre clavada solo puede deslizarse por la columna e (incluida la captura del atacante)
    expect(rookMoves.every((move) => move.to.col === 4)).toBe(true);
    expect(rookMoves.some((move) => move.to.row === 0)).toBe(true);
  });

  it('el rey no puede capturar una pieza protegida', () => {
    const board = boardWith(PIECE_TYPES.KING, WHITE, 7, 4);
    board[6][3] = createPiece(PIECE_TYPES.QUEEN, BLACK);
    board[6][7] = createPiece(PIECE_TYPES.ROOK, BLACK);
    const moves = getLegalMoves(board, WHITE, { applyMoveToBoardFn: applyMoveToBoard });
    const targets = moves.map((move) => `${move.to.row},${move.to.col}`);
    // d2 está protegida por la torre de h2 y d1 la controla la propia dama
    expect(targets).not.toContain('6,3');
    expect(targets).not.toContain('7,3');
    expect(targets).toContain('7,5');
  });

  it('una pieza puede bloquear un jaque', () => {
    const board = boardWith(PIECE_TYPES.KING, WHITE, 7, 4);
    board[6][0] = createPiece(PIECE_TYPES.ROOK, WHITE);
    board[0][4] = createPiece(PIECE_TYPES.ROOK, BLACK);
    const moves = getLegalMoves(board, WHITE, { applyMoveToBoardFn: applyMoveToBoard });
    const rookMoves = moves.filter((move) => move.piece === PIECE_TYPES.ROOK);
    const blocksOnFile = rookMoves.filter((move) => move.to.col === 4);
    expect(blocksOnFile.length).toBeGreaterThan(0);
  });
});

describe('aplicación de movimientos al tablero', () => {
  it('aplica una captura retirando la pieza del destino', () => {
    const board = boardWith(PIECE_TYPES.ROOK, WHITE, 4, 4);
    board[4][6] = createPiece(PIECE_TYPES.PAWN, BLACK);
    const move = {
      from: { row: 4, col: 4 },
      to: { row: 4, col: 6 },
      piece: PIECE_TYPES.ROOK,
      color: WHITE,
      capturedType: PIECE_TYPES.PAWN,
      capturedSquare: { row: 4, col: 6 },
      promotion: null,
      isEnPassant: false,
      isCastling: null,
      isDoublePawnPush: false,
    };
    const next = applyMoveToBoard(board, move);
    expect(next[4][4]).toBeNull();
    expect(next[4][6]).toEqual(createPiece(PIECE_TYPES.ROOK, WHITE));
  });

  it('el tablero original no se muta', () => {
    const board = boardWith(PIECE_TYPES.ROOK, WHITE, 4, 4);
    const move = {
      from: { row: 4, col: 4 },
      to: { row: 4, col: 5 },
      piece: PIECE_TYPES.ROOK,
      color: WHITE,
      capturedType: null,
      capturedSquare: null,
      promotion: null,
      isEnPassant: false,
      isCastling: null,
      isDoublePawnPush: false,
    };
    applyMoveToBoard(board, move);
    expect(board[4][4]).not.toBeNull();
    expect(board[4][5]).toBeNull();
  });

  it('no genera movimientos si el bando indicado no tiene piezas', () => {
    const board = createEmptyBoard();
    const moves = getLegalMoves(board, WHITE, { applyMoveToBoardFn: applyMoveToBoard });
    expect(moves).toHaveLength(0);
  });

  it('el tablero siempre mide 8x8 tras aplicar jugadas', () => {
    const board = createInitialBoard();
    const moves = getLegalMoves(board, WHITE, { applyMoveToBoardFn: applyMoveToBoard });
    const next = applyMoveToBoard(board, moves[0]);
    expect(next).toHaveLength(BOARD_SIZE);
  });
});
