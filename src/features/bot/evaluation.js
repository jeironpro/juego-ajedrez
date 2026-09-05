import { PIECE_VALUES, PIECE_TYPES, WHITE, BLACK } from '@/features/game/constants.js';
import { getPiecesOfColor } from '@/features/game/board.js';

// Bonificación de avance de peón por fila (cuanto más avanza, más cerca de coronar)
const PAWN_ADVANCE_BONUS = 8;

// Tablas de posición (piece-square tables) simplificadas, orientadas al ataque al centro.
// Las filas están escritas desde la perspectiva de las blancas (row 0 = octava fila);
// para las negras se reflejan verticalmente al consultar.
const CENTER_BONUS = [
  [0, 0, 0, 0, 0, 0, 0, 0],
  [0, 1, 1, 1, 1, 1, 1, 0],
  [0, 1, 2, 2, 2, 2, 1, 0],
  [0, 1, 2, 4, 4, 2, 1, 0],
  [0, 1, 2, 4, 4, 2, 1, 0],
  [0, 1, 2, 2, 2, 2, 1, 0],
  [0, 1, 1, 1, 1, 1, 1, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
];

const PAWN_TABLE = [
  [0, 0, 0, 0, 0, 0, 0, 0],
  [60, 60, 60, 60, 60, 60, 60, 60],
  [20, 22, 25, 30, 30, 25, 22, 20],
  [8, 10, 14, 24, 24, 14, 10, 8],
  [4, 6, 10, 20, 20, 10, 6, 4],
  [2, 2, 4, 8, 8, 4, 2, 2],
  [0, 0, 0, -4, -4, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
];

const KNIGHT_TABLE = [
  [-40, -30, -20, -20, -20, -20, -30, -40],
  [-30, -10, 0, 4, 4, 0, -10, -30],
  [-20, 0, 12, 16, 16, 12, 0, -20],
  [-20, 4, 16, 20, 20, 16, 4, -20],
  [-20, 0, 16, 20, 20, 16, 0, -20],
  [-20, 4, 12, 16, 16, 12, 4, -20],
  [-30, -10, 0, 4, 4, 0, -10, -30],
  [-40, -30, -20, -20, -20, -20, -30, -40],
];

const BISHOP_TABLE = [
  [-14, -8, -8, -8, -8, -8, -8, -14],
  [-8, 0, 0, 0, 0, 0, 0, -8],
  [-8, 0, 6, 10, 10, 6, 0, -8],
  [-8, 6, 6, 10, 10, 6, 6, -8],
  [-8, 0, 10, 10, 10, 10, 0, -8],
  [-8, 10, 10, 10, 10, 10, 10, -8],
  [-8, 6, 0, 0, 0, 0, 6, -8],
  [-14, -8, -8, -8, -8, -8, -8, -14],
];

const KING_TABLE = [
  [-40, -40, -40, -40, -40, -40, -40, -40],
  [-40, -40, -40, -40, -40, -40, -40, -40],
  [-40, -40, -40, -40, -40, -40, -40, -40],
  [-40, -40, -40, -40, -40, -40, -40, -40],
  [-30, -30, -30, -30, -30, -30, -30, -30],
  [-20, -20, -20, -20, -20, -20, -20, -20],
  [10, 10, 0, 0, 0, 0, 10, 10],
  [20, 30, 10, 0, 0, 10, 30, 20],
];

// Tabla de posición por tipo de pieza; el peón blanco consulta la tabla reflejada
const PIECE_TABLES = {
  [PIECE_TYPES.PAWN]: PAWN_TABLE,
  [PIECE_TYPES.KNIGHT]: KNIGHT_TABLE,
  [PIECE_TYPES.BISHOP]: BISHOP_TABLE,
  [PIECE_TYPES.QUEEN]: CENTER_BONUS,
  [PIECE_TYPES.ROOK]: CENTER_BONUS,
  [PIECE_TYPES.KING]: KING_TABLE,
};

// Devuelve el bonificador de posición de una pieza en una casilla
function getPositionalBonus(piece, row, col) {
  const table = PIECE_TABLES[piece.type];
  if (table === undefined) return 0;
  const pieceRow = piece.color === WHITE ? row : 7 - row;
  return table[pieceRow][col];
}

// Evalúa el material y la posición de un bando
export function evaluateSide(board, color) {
  let score = 0;
  for (const { piece, row, col } of getPiecesOfColor(board, color)) {
    score += PIECE_VALUES[piece.type];
    score += getPositionalBonus(piece, row, col);
    // El peón también recibe un pequeño bono por avanzar (falta para coronar)
    if (piece.type === PIECE_TYPES.PAWN) {
      const advance = piece.color === WHITE ? 6 - row : row - 1;
      score += advance * PAWN_ADVANCE_BONUS;
    }
  }
  return score;
}

// Evalúa el tablero desde la perspectiva del color indicado (positivo = mejor para ese color)
export function evaluateBoard(board, color) {
  const rival = color === WHITE ? BLACK : WHITE;
  return evaluateSide(board, color) - evaluateSide(board, rival);
}
