import { PIECE_TYPES } from './constants.js';
import { isInsideBoard } from './board.js';

// Direcciones ortogonales (torre) y diagonales (alfil), en coordenadas de matriz
const ORTHOGONAL_DIRECTIONS = [
  { row: -1, col: 0 },
  { row: 1, col: 0 },
  { row: 0, col: -1 },
  { row: 0, col: 1 },
];

const DIAGONAL_DIRECTIONS = [
  { row: -1, col: -1 },
  { row: -1, col: 1 },
  { row: 1, col: -1 },
  { row: 1, col: 1 },
];

// Saltos en L del caballo
const KNIGHT_OFFSETS = [
  { row: -2, col: -1 },
  { row: -2, col: 1 },
  { row: -1, col: -2 },
  { row: -1, col: 2 },
  { row: 1, col: -2 },
  { row: 1, col: 2 },
  { row: 2, col: -1 },
  { row: 2, col: 1 },
];

// Fila de origen de los peones de cada bando (permite el avance doble)
export const PAWN_START_ROWS = {
  white: 6,
  black: 1,
};

// Fila donde se encuentra el rey de cada bando al iniciar la partida
export const KING_START_ROWS = {
  white: 7,
  black: 0,
};

// Columna de origen del rey
export const KING_START_COLUMN = 4;

// Definición de los dos enroques: casillas que deben estar libres y seguras de jaque,
// y casillas de destino del rey y de la torre (col 0 = torre de dama, col 7 = torre de rey)
const CASTLING_PATHS = {
  kingSide: {
    rookFromCol: 7,
    rookToCol: 5,
    empty: [5, 6],
    safe: [4, 5, 6],
    kingToCol: 6,
  },
  queenSide: {
    rookFromCol: 0,
    rookToCol: 3,
    empty: [1, 2, 3],
    safe: [2, 3, 4],
    kingToCol: 2,
  },
};

// Genera los movimientos pseudolegales de una pieza deslizante (torre, alfil o dama)
function getSlidingTargets(board, row, col, piece, directions) {
  const targets = [];
  for (const direction of directions) {
    let nextRow = row + direction.row;
    let nextCol = col + direction.col;
    while (isInsideBoard(nextRow, nextCol)) {
      const occupant = board[nextRow][nextCol];
      if (occupant === null) {
        targets.push({ row: nextRow, col: nextCol });
      } else {
        // la primera pieza corta el deslizamiento: capturable si es rival
        if (occupant.color !== piece.color) {
          targets.push({ row: nextRow, col: nextCol });
        }
        break;
      }
      nextRow += direction.row;
      nextCol += direction.col;
    }
  }
  return targets;
}

// Genera los movimientos pseudolegales de cada tipo de pieza desde una casilla.
// La captura al paso y el enroque se resuelven en moves.js con el estado de la partida.
export function getPseudoLegalTargets(board, row, col) {
  const piece = board[row][col];
  const enemyColor = piece.color === 'white' ? 'black' : 'white';

  switch (piece.type) {
    case PIECE_TYPES.PAWN: {
      const targets = [];
      // El blanco avanza hacia row 0 y el negro hacia row 7
      const forward = piece.color === 'white' ? -1 : 1;
      const startRow = PAWN_START_ROWS[piece.color];

      // Avance de una casilla y avance doble desde la fila de origen
      for (const step of [1, 2]) {
        if (step === 2 && row !== startRow) break;
        const nextRow = row + forward * step;
        if (!isInsideBoard(nextRow, col) || board[nextRow][col] !== null) break;
        targets.push({ row: nextRow, col });
      }

      // Capturas diagonales
      for (const side of [-1, 1]) {
        const nextRow = row + forward;
        const nextCol = col + side;
        if (!isInsideBoard(nextRow, nextCol)) continue;
        const occupant = board[nextRow][nextCol];
        if (occupant !== null && occupant.color === enemyColor) {
          targets.push({ row: nextRow, col: nextCol });
        }
      }
      return targets;
    }

    case PIECE_TYPES.KNIGHT:
      return KNIGHT_OFFSETS.map((offset) => ({ row: row + offset.row, col: col + offset.col }));

    case PIECE_TYPES.BISHOP:
      return getSlidingTargets(board, row, col, piece, DIAGONAL_DIRECTIONS);

    case PIECE_TYPES.ROOK:
      return getSlidingTargets(board, row, col, piece, ORTHOGONAL_DIRECTIONS);

    case PIECE_TYPES.QUEEN:
      return getSlidingTargets(
        board,
        row,
        col,
        piece,
        DIAGONAL_DIRECTIONS.concat(ORTHOGONAL_DIRECTIONS),
      );

    case PIECE_TYPES.KING: {
      // Un paso en cualquier dirección
      const targets = [];
      for (const diagonal of DIAGONAL_DIRECTIONS) {
        targets.push({ row: row + diagonal.row, col: col + diagonal.col });
      }
      for (const orthogonal of ORTHOGONAL_DIRECTIONS) {
        targets.push({ row: row + orthogonal.row, col: col + orthogonal.col });
      }
      return targets;
    }

    default:
      return [];
  }
}

// Indica si la torre de la columna indicada sigue en su casilla de origen
function isRookOnStartSquare(board, row, col, color) {
  const rook = board[row][col];
  return rook !== null && rook.type === PIECE_TYPES.ROOK && rook.color === color;
}

// Indica si el enroque indicado tiene el rey y la torre en origen y el camino libre.
// La validación de jaques la hace moves.js sobre las casillas "safe".
export function isCastlingPathClear(board, color, side) {
  const row = KING_START_ROWS[color];
  const path = CASTLING_PATHS[side];
  if (!isRookOnStartSquare(board, row, path.rookFromCol, color)) return false;
  const king = board[row][KING_START_COLUMN];
  if (king === null || king.type !== PIECE_TYPES.KING || king.color !== color) return false;
  return path.empty.every((col) => board[row][col] === null);
}

// Casillas (columnas de la fila del rey) que no deben estar atacadas durante el enroque
export function getCastlingSafeColumns(side) {
  return CASTLING_PATHS[side].safe;
}

// Columna de destino del rey en el enroque indicado
export function getCastlingKingTargetColumn(side) {
  return CASTLING_PATHS[side].kingToCol;
}

// Casillas de la torre (origen y destino) en el enroque indicado
export function getCastlingRookSquares(side) {
  return { fromCol: CASTLING_PATHS[side].rookFromCol, toCol: CASTLING_PATHS[side].rookToCol };
}
