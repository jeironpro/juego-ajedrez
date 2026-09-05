import { PIECE_TYPES, PIECE_VALUES, WHITE, BLACK } from '@/features/game/constants.js';

// Glifos Unicode de las piezas: el conjunto blanco se dibuja como contorno y el
// negro como silueta rellena, la convención habitual en tableros de texto
export const PIECE_GLYPHS = {
  [WHITE]: {
    [PIECE_TYPES.KING]: '♔',
    [PIECE_TYPES.QUEEN]: '♕',
    [PIECE_TYPES.ROOK]: '♖',
    [PIECE_TYPES.BISHOP]: '♗',
    [PIECE_TYPES.KNIGHT]: '♘',
    [PIECE_TYPES.PAWN]: '♙',
  },
  [BLACK]: {
    [PIECE_TYPES.KING]: '♚',
    [PIECE_TYPES.QUEEN]: '♛',
    [PIECE_TYPES.ROOK]: '♜',
    [PIECE_TYPES.BISHOP]: '♝',
    [PIECE_TYPES.KNIGHT]: '♞',
    [PIECE_TYPES.PAWN]: '♟',
  },
};

// Nombre legible de cada pieza (para etiquetas accesibles)
export const PIECE_NAMES = {
  [PIECE_TYPES.KING]: 'rey',
  [PIECE_TYPES.QUEEN]: 'dama',
  [PIECE_TYPES.ROOK]: 'torre',
  [PIECE_TYPES.BISHOP]: 'alfil',
  [PIECE_TYPES.KNIGHT]: 'caballo',
  [PIECE_TYPES.PAWN]: 'peón',
};

// Ordena las piezas capturadas de mayor a menor valor material (para mostrarlas
// de forma estable en las bandejas de capturas)
export function sortCapturedPieces(pieces) {
  return [...pieces].sort((a, b) => PIECE_VALUES[b.type] - PIECE_VALUES[a.type]);
}
