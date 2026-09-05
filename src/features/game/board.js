import { BOARD_SIZE, WHITE, BLACK, PIECE_TYPES } from './constants.js';

// Nombres de las columnas en notación algebraica (de la a a la h)
const FILES = 'abcdefgh';

// Crea un tablero vacío de 8x8 como matriz de filas (row 0 = octava fila del ajedrez)
export function createEmptyBoard() {
  return Array.from({ length: BOARD_SIZE }, () => Array(BOARD_SIZE).fill(null));
}

// Indica si una casilla está dentro de los límites del tablero
export function isInsideBoard(row, col) {
  return row >= 0 && row < BOARD_SIZE && col >= 0 && col < BOARD_SIZE;
}

// Convierte coordenadas de matriz (row, col) a notación algebraica ("e4")
export function toAlgebraic(row, col) {
  return `${FILES[col]}${BOARD_SIZE - row}`;
}

// Convierte notación algebraica ("e4") a coordenadas de matriz { row, col }
export function fromAlgebraic(square) {
  const col = FILES.indexOf(square[0]);
  const row = BOARD_SIZE - Number(square.slice(1));
  return { row, col };
}

// Fábrica de piezas inmutables
export function createPiece(type, color) {
  return { type, color };
}

// Posición inicial estándar; el blanco ocupa las dos últimas filas de la matriz
export function createInitialBoard() {
  const board = createEmptyBoard();
  const backRank = [
    PIECE_TYPES.ROOK,
    PIECE_TYPES.KNIGHT,
    PIECE_TYPES.BISHOP,
    PIECE_TYPES.QUEEN,
    PIECE_TYPES.KING,
    PIECE_TYPES.BISHOP,
    PIECE_TYPES.KNIGHT,
    PIECE_TYPES.ROOK,
  ];

  // Piezas mayores y menores de cada bando en sus filas de origen
  for (let col = 0; col < BOARD_SIZE; col += 1) {
    board[0][col] = createPiece(backRank[col], BLACK);
    board[1][col] = createPiece(PIECE_TYPES.PAWN, BLACK);
    board[BOARD_SIZE - 2][col] = createPiece(PIECE_TYPES.PAWN, WHITE);
    board[BOARD_SIZE - 1][col] = createPiece(backRank[col], WHITE);
  }
  return board;
}

// Cuenta las piezas de un bando en el tablero
export function countPieces(board, color) {
  let count = 0;
  for (let row = 0; row < BOARD_SIZE; row += 1) {
    for (let col = 0; col < BOARD_SIZE; col += 1) {
      const piece = board[row][col];
      if (piece !== null && piece.color === color) count += 1;
    }
  }
  return count;
}

// Devuelve el bando contrario
export function switchPlayer(color) {
  return color === WHITE ? BLACK : WHITE;
}

// Recorre el tablero y aplica un callback sobre cada pieza con su posición
function forEachPiece(board, callback) {
  for (let row = 0; row < BOARD_SIZE; row += 1) {
    for (let col = 0; col < BOARD_SIZE; col += 1) {
      const piece = board[row][col];
      if (piece !== null) callback(piece, row, col);
    }
  }
}

// Lista las posiciones { piece, row, col } de todas las piezas de un bando
export function getPiecesOfColor(board, color) {
  const pieces = [];
  forEachPiece(board, (piece, row, col) => {
    if (piece.color === color) pieces.push({ piece, row, col });
  });
  return pieces;
}
