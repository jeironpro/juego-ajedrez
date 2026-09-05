import { PIECE_VALUES, GAME_END_REASONS, PIECE_TYPES } from './constants.js';

// Puntuación de mate: suficiente para dominar cualquier combinación de material
const MATE_SCORE = 100000;
// Puntuación de tablas, simétrica respecto de la perspectiva del jugador
const DRAW_SCORE = 0;

// Suma el valor material de las piezas de un bando
export function getMaterialScore(board, color) {
  let score = 0;
  for (let row = 0; row < 8; row += 1) {
    for (let col = 0; col < 8; col += 1) {
      const piece = board[row][col];
      if (piece !== null && piece.color === color) score += PIECE_VALUES[piece.type];
    }
  }
  return score;
}

// Heurística de fin de partida: victoria del bando indicado o tablas según el motivo
export function evaluateGameEnd(game, forColor) {
  if (!game.over) return null;
  if (game.winner === null) return DRAW_SCORE;
  return game.winner === forColor ? MATE_SCORE : -MATE_SCORE;
}

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

export { MATE_SCORE, DRAW_SCORE, GAME_END_REASONS };
