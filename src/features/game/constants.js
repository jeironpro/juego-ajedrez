// Constantes del juego de ajedrez

// Tamaño del tablero (8x8)
export const BOARD_SIZE = 8;

// Identificadores de jugadores; WHITE siempre abre la partida
export const WHITE = 'white';
export const BLACK = 'black';

// Tipos de pieza
export const PIECE_TYPES = {
  PAWN: 'pawn',
  KNIGHT: 'knight',
  BISHOP: 'bishop',
  ROOK: 'rook',
  QUEEN: 'queen',
  KING: 'king',
};

// Valor material de cada pieza para la heurística del bot
export const PIECE_VALUES = {
  [PIECE_TYPES.PAWN]: 100,
  [PIECE_TYPES.KNIGHT]: 320,
  [PIECE_TYPES.BISHOP]: 330,
  [PIECE_TYPES.ROOK]: 500,
  [PIECE_TYPES.QUEEN]: 900,
  [PIECE_TYPES.KING]: 20000,
};

// Fila de coronación de cada bando: los peones blancos promocionan arriba y los negros abajo
export const PROMOTION_ROW = {
  [WHITE]: 0,
  [BLACK]: BOARD_SIZE - 1,
};

// Estados en los que puede terminar una partida
export const GAME_END_REASONS = {
  CHECKMATE: 'checkmate',
  STALEMATE: 'stalemate',
  INSUFFICIENT_MATERIAL: 'insufficient_material',
  FIFTY_MOVE_RULE: 'fifty_move_rule',
  THREEFOLD_REPETITION: 'threefold_repetition',
};
