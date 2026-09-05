import { PIECE_TYPES } from './constants.js';

// Detecta material insuficiente con la regla simplificada de FIDE:
// no hay peones, torres ni damas, y ningún bando tiene más de una pieza menor
export function hasInsufficientMaterial(board) {
  let minors = 0;

  for (let row = 0; row < 8; row += 1) {
    for (let col = 0; col < 8; col += 1) {
      const piece = board[row][col];
      if (piece === null || piece.type === PIECE_TYPES.KING) continue;
      if (
        piece.type === PIECE_TYPES.PAWN ||
        piece.type === PIECE_TYPES.ROOK ||
        piece.type === PIECE_TYPES.QUEEN
      ) {
        return false;
      }
      minors += 1;
    }
  }
  return minors <= 1;
}
