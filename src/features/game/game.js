import { WHITE, BLACK, PIECE_TYPES, GAME_END_REASONS } from './constants.js';
import { createInitialBoard, switchPlayer } from './board.js';
import { getLegalMoves, isInCheck, isLegalMove, moveToNotation } from './moves.js';
import { hasInsufficientMaterial } from './endgame.js';
import { applyMoveToBoard } from './apply.js';
import { KING_START_ROWS } from './pieces.js';

// Letra de cada tipo de pieza para construir la clave de posición (mayúscula = blanca)
const PIECE_LETTERS = {
  [PIECE_TYPES.PAWN]: 'p',
  [PIECE_TYPES.KNIGHT]: 'n',
  [PIECE_TYPES.BISHOP]: 'b',
  [PIECE_TYPES.ROOK]: 'r',
  [PIECE_TYPES.QUEEN]: 'q',
  [PIECE_TYPES.KING]: 'k',
};

// Número de medios movimientos (semijugadas) sin capturas ni movimientos de peón
// que provocan tablas por la regla de los 50 movimientos
const FIFTY_MOVE_LIMIT = 100;
// Repeticiones de la misma posición que provocan tablas
const REPETITION_LIMIT = 3;

// Clave canónica de una posición: disposición de piezas + bando al que le toca mover
export function positionKey(board, turn) {
  const rows = board
    .map((row) =>
      row
        .map((piece) => {
          if (piece === null) return '.';
          const letter = PIECE_LETTERS[piece.type];
          return piece.color === WHITE ? letter.toUpperCase() : letter;
        })
        .join(''),
    )
    .join('/');
  return `${rows}|${turn}`;
}

// Derechos de enroque iniciales: ambos bandos pueden enrocar por ambos lados
function createInitialCastlingRights() {
  return {
    [WHITE]: { kingSide: true, queenSide: true },
    [BLACK]: { kingSide: true, queenSide: true },
  };
}

// Contador de posiciones inicial: la posición de arranque cuenta como primera aparición
function createInitialPositionCounts(board, turn) {
  return { [positionKey(board, turn)]: 1 };
}

// Crea el estado inicial de la partida
export function createGame() {
  const board = createInitialBoard();
  return {
    board,
    turn: WHITE,
    castlingRights: createInitialCastlingRights(),
    enPassantTarget: null,
    halfmoveClock: 0,
    fullmoveNumber: 1,
    positionCounts: createInitialPositionCounts(board, WHITE),
    history: [],
    capturedPieces: [],
    undoUsed: false,
    lastMove: null,
    over: false,
    winner: null,
    endReason: null,
  };
}

// Indica si la jugada mueve una torre desde su casilla de origen
function isRookLeavingHomeSquare(move, row) {
  return move.piece === PIECE_TYPES.ROOK && move.from.row === row;
}

// Actualiza los derechos de enroque tras una jugada: rey movido, torre movida o capturada.
// Se exporta para que el bot pueda simular estados intermedios en su búsqueda.
export function updateCastlingRights(castlingRights, move) {
  const next = {
    [WHITE]: { ...castlingRights[WHITE] },
    [BLACK]: { ...castlingRights[BLACK] },
  };

  // Mover el rey anula ambos enroques del bando
  if (move.piece === PIECE_TYPES.KING) {
    next[move.color] = { kingSide: false, queenSide: false };
  }

  // Mover una torre desde su origen anula ese enroque
  const ownKingRow = KING_START_ROWS[move.color];
  if (isRookLeavingHomeSquare(move, ownKingRow)) {
    if (move.from.col === 0) next[move.color].queenSide = false;
    if (move.from.col === 7) next[move.color].kingSide = false;
  }

  // Capturar una torre rival en su origen anula ese enroque
  if (move.capturedType === PIECE_TYPES.ROOK && move.capturedSquare !== null) {
    const rivalColor = switchPlayer(move.color);
    const rivalKingRow = KING_START_ROWS[rivalColor];
    if (move.capturedSquare.row === rivalKingRow) {
      if (move.capturedSquare.col === 0) next[rivalColor].queenSide = false;
      if (move.capturedSquare.col === 7) next[rivalColor].kingSide = false;
    }
  }
  return next;
}

// Detecta si la partida ha terminado y devuelve { winner, reason } o null.
// Se exporta para poder evaluar finales sobre estados sintéticos en los tests.
export function detectGameEnd(game) {
  const moves = getLegalMoves(game.board, game.turn, {
    castlingRights: game.castlingRights,
    enPassantTarget: game.enPassantTarget,
    applyMoveToBoardFn: applyMoveToBoard,
  });

  if (moves.length === 0) {
    // Sin movimientos: mate si hay jaque, ahogado en caso contrario
    if (isInCheck(game.board, game.turn)) {
      return { winner: switchPlayer(game.turn), reason: GAME_END_REASONS.CHECKMATE };
    }
    return { winner: null, reason: GAME_END_REASONS.STALEMATE };
  }

  if (hasInsufficientMaterial(game.board)) {
    return { winner: null, reason: GAME_END_REASONS.INSUFFICIENT_MATERIAL };
  }
  if (game.halfmoveClock >= FIFTY_MOVE_LIMIT) {
    return { winner: null, reason: GAME_END_REASONS.FIFTY_MOVE_RULE };
  }
  if (game.positionCounts[positionKey(game.board, game.turn)] >= REPETITION_LIMIT) {
    return { winner: null, reason: GAME_END_REASONS.THREEFOLD_REPETITION };
  }
  return null;
}

// Aplica un movimiento validándolo; devuelve un estado de partida nuevo (inmutable)
export function applyMove(game, move) {
  if (game.over) throw new Error('The game has already ended');
  if (!isLegalMove(game, move)) throw new Error('Invalid move');

  // Metadatos de la jugada: avance doble del peón y notación
  const isDoublePawnPush =
    move.piece === PIECE_TYPES.PAWN && Math.abs(move.to.row - move.from.row) === 2;
  const enrichedMove = { ...move, isDoublePawnPush };

  const nextBoard = applyMoveToBoard(game.board, enrichedMove);
  const nextTurn = switchPlayer(game.turn);

  // Objetivo de captura al paso: casilla tras el peón que avanzó dos
  const enPassantTarget = isDoublePawnPush
    ? { row: (move.from.row + move.to.row) / 2, col: move.to.col }
    : null;

  // El reloj de la regla de 50 movimientos se reinicia con capturas o movimientos de peón
  const resetsClock = move.capturedType !== null || move.piece === PIECE_TYPES.PAWN;
  const halfmoveClock = resetsClock ? 0 : game.halfmoveClock + 1;

  // El número de jugada completa avanza después de mover las negras
  const fullmoveNumber = game.turn === BLACK ? game.fullmoveNumber + 1 : game.fullmoveNumber;

  const lastMove = {
    from: move.from,
    to: move.to,
    piece: move.piece,
    color: move.color,
    notation: moveToNotation(move),
    isCapture: move.capturedType !== null,
    isEnPassant: move.isEnPassant,
    isCastling: move.isCastling,
  };

  // Registro de la pieza capturada: { type, color } con el color de la pieza comida.
  // Lo consume la interfaz para mostrar las capturas junto a cada jugador.
  const capturedPiece =
    move.capturedType === null
      ? null
      : { type: move.capturedType, color: switchPlayer(move.color) };
  const capturedPieces =
    capturedPiece === null ? game.capturedPieces : [...game.capturedPieces, capturedPiece];

  // Instantánea del estado previo para poder deshacer una jugada
  const history = [
    ...game.history,
    {
      board: game.board,
      turn: game.turn,
      castlingRights: game.castlingRights,
      enPassantTarget: game.enPassantTarget,
      halfmoveClock: game.halfmoveClock,
      fullmoveNumber: game.fullmoveNumber,
      positionCounts: game.positionCounts,
      capturedPieces: game.capturedPieces,
      lastMove: game.lastMove,
    },
  ];

  // Registro de repeticiones de la posición resultante
  const positionCounts = { ...game.positionCounts };
  const nextKey = positionKey(nextBoard, nextTurn);
  positionCounts[nextKey] = (positionCounts[nextKey] ?? 0) + 1;

  const next = {
    board: nextBoard,
    turn: nextTurn,
    castlingRights: updateCastlingRights(game.castlingRights, move),
    enPassantTarget,
    halfmoveClock,
    fullmoveNumber,
    positionCounts,
    history,
    capturedPieces,
    undoUsed: game.undoUsed,
    lastMove,
    over: false,
    winner: null,
    endReason: null,
  };

  const end = detectGameEnd(next);
  if (end !== null) {
    next.over = true;
    next.winner = end.winner;
    next.endReason = end.reason;
  }
  return next;
}

// Deshace las últimas `plies` jugadas (una sola vez por partida); restaura el estado previo.
// En modo bot la UI pide 2 pliegues para revertir también la respuesta del bot.
export function undoMove(game, plies = 1) {
  if (game.undoUsed || game.history.length === 0) return game;
  const count = Math.min(plies, game.history.length);
  const previous = game.history[game.history.length - count];
  return {
    board: previous.board,
    turn: previous.turn,
    castlingRights: previous.castlingRights,
    enPassantTarget: previous.enPassantTarget,
    halfmoveClock: previous.halfmoveClock,
    fullmoveNumber: previous.fullmoveNumber,
    positionCounts: previous.positionCounts,
    capturedPieces: previous.capturedPieces,
    lastMove: previous.lastMove,
    history: game.history.slice(0, -count),
    undoUsed: true,
    over: false,
    winner: null,
    endReason: null,
  };
}
