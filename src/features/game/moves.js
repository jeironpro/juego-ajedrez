import { PIECE_TYPES, WHITE, PROMOTION_ROW, BOARD_SIZE } from './constants.js';
import { toAlgebraic, getPiecesOfColor, switchPlayer } from './board.js';
import { applyMoveToBoard } from './apply.js';
import {
  getPseudoLegalTargets,
  isCastlingPathClear,
  getCastlingSafeColumns,
  getCastlingKingTargetColumn,
  KING_START_ROWS,
  KING_START_COLUMN,
} from './pieces.js';

// Direcciones de ataque, reutilizadas por la detección de jaques
const ORTHOGONAL = [
  { row: -1, col: 0 },
  { row: 1, col: 0 },
  { row: 0, col: -1 },
  { row: 0, col: 1 },
];
const DIAGONAL = [
  { row: -1, col: -1 },
  { row: -1, col: 1 },
  { row: 1, col: -1 },
  { row: 1, col: 1 },
];
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

function isInside(row, col) {
  return row >= 0 && row < BOARD_SIZE && col >= 0 && col < BOARD_SIZE;
}

// Encuentra la posición del rey de un bando
export function findKing(board, color) {
  for (const { piece, row, col } of getPiecesOfColor(board, color)) {
    if (piece.type === PIECE_TYPES.KING) return { row, col };
  }
  return null;
}

// Indica si la casilla indicada está atacada por alguna pieza del color dado.
// Se recorre desde la casilla hacia fuera (rayos, caballos, peones y rey enemigo).
export function isSquareAttacked(board, row, col, byColor) {
  // Caballos enemigos
  for (const offset of KNIGHT_OFFSETS) {
    const targetRow = row + offset.row;
    const targetCol = col + offset.col;
    if (!isInside(targetRow, targetCol)) continue;
    const piece = board[targetRow][targetCol];
    if (piece !== null && piece.color === byColor && piece.type === PIECE_TYPES.KNIGHT) {
      return true;
    }
  }

  // Rey enemigo (adyacente a una casilla)
  for (const direction of [...ORTHOGONAL, ...DIAGONAL]) {
    const targetRow = row + direction.row;
    const targetCol = col + direction.col;
    if (!isInside(targetRow, targetCol)) continue;
    const piece = board[targetRow][targetCol];
    if (piece !== null && piece.color === byColor && piece.type === PIECE_TYPES.KING) return true;
  }

  // Peones enemigos: atacan en diagonal según su dirección de avance
  const pawnRow = byColor === WHITE ? row + 1 : row - 1;
  for (const side of [-1, 1]) {
    const pawnCol = col + side;
    if (!isInside(pawnRow, pawnCol)) continue;
    const piece = board[pawnRow][pawnCol];
    if (piece !== null && piece.color === byColor && piece.type === PIECE_TYPES.PAWN) return true;
  }

  // Piezas deslizantes: primer ocupante de cada rayo
  for (const direction of ORTHOGONAL) {
    let nextRow = row + direction.row;
    let nextCol = col + direction.col;
    while (isInside(nextRow, nextCol)) {
      const piece = board[nextRow][nextCol];
      if (piece !== null) {
        const isSlider =
          piece.color === byColor &&
          (piece.type === PIECE_TYPES.ROOK || piece.type === PIECE_TYPES.QUEEN);
        if (isSlider) return true;
        break;
      }
      nextRow += direction.row;
      nextCol += direction.col;
    }
  }
  for (const direction of DIAGONAL) {
    let nextRow = row + direction.row;
    let nextCol = col + direction.col;
    while (isInside(nextRow, nextCol)) {
      const piece = board[nextRow][nextCol];
      if (piece !== null) {
        const isSlider =
          piece.color === byColor &&
          (piece.type === PIECE_TYPES.BISHOP || piece.type === PIECE_TYPES.QUEEN);
        if (isSlider) return true;
        break;
      }
      nextRow += direction.row;
      nextCol += direction.col;
    }
  }
  return false;
}

// Indica si el rey del color dado está en jaque
export function isInCheck(board, color) {
  const king = findKing(board, color);
  if (king === null) return false;
  return isSquareAttacked(board, king.row, king.col, switchPlayer(color));
}

// Crea el movimiento base con todos sus metadatos vacíos
function createBaseMove(from, to, piece) {
  return {
    from,
    to,
    piece: piece.type,
    color: piece.color,
    capturedType: null,
    capturedSquare: null,
    promotion: null,
    isEnPassant: false,
    isCastling: null,
    isDoublePawnPush: false,
  };
}

// Genera los movimientos pseudolegales del bando indicado (sin validar jaques)
export function getPseudoLegalMoves(board, color) {
  const moves = [];
  for (const { piece, row, col } of getPiecesOfColor(board, color)) {
    const targets = getPseudoLegalTargets(board, row, col);
    for (const target of targets) {
      if (!isInside(target.row, target.col)) continue;
      const occupant = board[target.row][target.col];
      if (occupant !== null && occupant.color === color) continue;
      const move = createBaseMove({ row, col }, target, piece);
      if (occupant !== null) {
        move.capturedType = occupant.type;
        move.capturedSquare = { row: target.row, col: target.col };
      }
      moves.push(move);
    }
  }
  return moves;
}

// Genera los movimientos de captura al paso: peones propios adyacentes al objetivo.
// El movimiento se añade aquí (no existe en el avance pseudolegal) y su legalidad
// final (incluida la variante del peón clavado al paso) la valida el filtro de jaques.
export function annotateEnPassant(moves, board, color, enPassantTarget) {
  if (enPassantTarget === null) return moves;
  const result = [...moves];
  // El peón capturador se encuentra una fila por detrás del objetivo, según su avance
  const capturingRow = enPassantTarget.row + (color === WHITE ? 1 : -1);
  for (const col of [enPassantTarget.col - 1, enPassantTarget.col + 1]) {
    if (!isInside(capturingRow, col)) continue;
    const piece = board[capturingRow][col];
    if (piece === null || piece.color !== color || piece.type !== PIECE_TYPES.PAWN) continue;
    result.push({
      from: { row: capturingRow, col },
      to: { row: enPassantTarget.row, col: enPassantTarget.col },
      piece: PIECE_TYPES.PAWN,
      color,
      capturedType: PIECE_TYPES.PAWN,
      capturedSquare: { row: capturingRow, col: enPassantTarget.col },
      promotion: null,
      isEnPassant: true,
      isCastling: null,
      isDoublePawnPush: false,
    });
  }
  return result;
}

// Añade los enroques permitidos: derechos vigentes, camino libre y casillas seguras
export function annotateCastling(moves, board, color, castlingRights) {
  const result = [...moves];
  const kingRow = KING_START_ROWS[color];
  for (const side of ['kingSide', 'queenSide']) {
    if (!castlingRights[color][side]) continue;
    if (!isCastlingPathClear(board, color, side)) continue;

    // El rey no puede estar en jaque ni atravesar casillas atacadas
    const safeColumns = getCastlingSafeColumns(side);
    const allSafe = safeColumns.every(
      (col) => !isSquareAttacked(board, kingRow, col, switchPlayer(color)),
    );
    if (!allSafe) continue;

    result.push({
      from: { row: kingRow, col: KING_START_COLUMN },
      to: { row: kingRow, col: getCastlingKingTargetColumn(side) },
      piece: PIECE_TYPES.KING,
      color,
      capturedType: null,
      capturedSquare: null,
      promotion: null,
      isEnPassant: false,
      isCastling: side,
      isDoublePawnPush: false,
    });
  }
  return result;
}

// Convierte un movimiento a notación algebraica simplificada (origen-destino + coronación)
export function moveToNotation(move) {
  const promotionSuffix = move.promotion !== null ? `=${move.promotion[0].toUpperCase()}` : '';
  return `${toAlgebraic(move.from.row, move.from.col)}${toAlgebraic(
    move.to.row,
    move.to.col,
  )}${promotionSuffix}`;
}

// Clave canónica de un movimiento, usada para validar jugadas entrantes
export function moveKey(move) {
  return moveToNotation(move);
}

// Filtra los movimientos que dejan al propio rey en jaque
function filterMovesLeavingKingInCheck(board, color, moves, applyMoveToBoardFn) {
  return moves.filter((move) => {
    const nextBoard = applyMoveToBoardFn(board, move);
    return !isInCheck(nextBoard, color);
  });
}

// Expande las coronaciones de peón a las cuatro piezas posibles
function expandPromotions(moves, color) {
  const expanded = [];
  for (const move of moves) {
    if (move.piece === PIECE_TYPES.PAWN && move.to.row === PROMOTION_ROW[color]) {
      for (const promotionType of ['queen', 'rook', 'bishop', 'knight']) {
        expanded.push({ ...move, promotion: promotionType });
      }
    } else {
      expanded.push(move);
    }
  }
  return expanded;
}

// Movimientos completamente legales del bando indicado
export function getLegalMoves(
  board,
  color,
  { castlingRights = null, enPassantTarget = null, applyMoveToBoardFn } = {},
) {
  let moves = getPseudoLegalMoves(board, color);
  moves = annotateEnPassant(moves, board, color, enPassantTarget);
  if (castlingRights !== null) {
    moves = annotateCastling(moves, board, color, castlingRights);
  }

  const safeMoves = filterMovesLeavingKingInCheck(board, color, moves, applyMoveToBoardFn);
  return expandPromotions(safeMoves, color);
}

// Indica si un movimiento dado es legal según el estado actual
export function isLegalMove(state, move) {
  const legal = getLegalMoves(state.board, state.turn, {
    castlingRights: state.castlingRights,
    enPassantTarget: state.enPassantTarget,
    applyMoveToBoardFn: applyMoveToBoard,
  });
  return legal.some((candidate) => moveKey(candidate) === moveKey(move));
}
