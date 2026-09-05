import { getCastlingRookSquares, KING_START_ROWS } from './pieces.js';

// Aplica un movimiento pseudolegal al tablero y devuelve un tablero nuevo (inmutable).
// Gestiona la retirada de la pieza capturada (normal o al paso), la coronación
// y el desplazamiento de la torre durante el enroque.
export function applyMoveToBoard(board, move) {
  const next = board.map((rowCells) => [...rowCells]);
  const piece = next[move.from.row][move.from.col];
  if (piece === null) {
    throw new Error('There is no piece on the origin square');
  }

  // Retira la pieza de su origen y la pieza capturada, si la hay
  next[move.from.row][move.from.col] = null;
  if (move.capturedSquare !== null) {
    next[move.capturedSquare.row][move.capturedSquare.col] = null;
  }

  // Coloca la pieza en el destino, sustituida por la pieza de coronación si aplica
  next[move.to.row][move.to.col] =
    move.promotion !== null ? { type: move.promotion, color: piece.color } : piece;

  // Mueve la torre cuando la jugada es un enroque
  if (move.isCastling !== null) {
    const row = KING_START_ROWS[move.color];
    const { fromCol, toCol } = getCastlingRookSquares(move.isCastling);
    next[row][toCol] = next[row][fromCol];
    next[row][fromCol] = null;
  }
  return next;
}
