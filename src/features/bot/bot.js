import { PIECE_TYPES, PIECE_VALUES } from '@/features/game/constants.js';
import { switchPlayer } from '@/features/game/board.js';
import { getLegalMoves, isInCheck } from '@/features/game/moves.js';
import { applyMoveToBoard } from '@/features/game/apply.js';
import { updateCastlingRights } from '@/features/game/game.js';
import { evaluateBoard } from './evaluation.js';
import { DIFFICULTY_DEPTHS } from './difficulty.js';

// Puntuación que representa una victoria segura
const WIN_SCORE = 1000000;

// Situación de la búsqueda: tablero, bando al que le toca, derechos de enroque
// y objetivo de captura al paso vigente. Se va transformando con cada jugada simulada.
function createSearchState(game) {
  return {
    board: game.board,
    turn: game.turn,
    castlingRights: game.castlingRights,
    enPassantTarget: game.enPassantTarget,
  };
}

// Aplica una jugada simulada a un estado de búsqueda y devuelve el estado siguiente
function applyToSearchState(state, move) {
  const isDoublePawnPush =
    move.piece === PIECE_TYPES.PAWN && Math.abs(move.to.row - move.from.row) === 2;
  return {
    board: applyMoveToBoard(state.board, move),
    turn: switchPlayer(state.turn),
    castlingRights: updateCastlingRights(state.castlingRights, move),
    enPassantTarget: isDoublePawnPush
      ? { row: (move.from.row + move.to.row) / 2, col: move.to.col }
      : null,
  };
}

// Genera los movimientos legales para un estado de búsqueda
function getMovesForState(state) {
  return getLegalMoves(state.board, state.turn, {
    castlingRights: state.castlingRights,
    enPassantTarget: state.enPassantTarget,
    applyMoveToBoardFn: applyMoveToBoard,
  });
}

// Ordena las jugadas poniendo primero las capturas más valiosas (mejora la poda)
function orderMoves(moves) {
  return [...moves].sort((a, b) => {
    const captureScore = (move) =>
      move.capturedType === null ? 0 : PIECE_VALUES[move.capturedType];
    return captureScore(b) - captureScore(a);
  });
}

// Búsqueda negamax con poda alfa-beta. Todas las puntuaciones son desde la
// perspectiva del bando al que le toca mover; el padre niega el resultado.
function search(state, depth, alpha, beta) {
  const moves = getMovesForState(state);

  // Sin movimientos legales: mate (derrota) o ahogado (tablas)
  if (moves.length === 0) {
    return isInCheck(state.board, state.turn) ? -WIN_SCORE : 0;
  }

  // Profundidad agotada: evaluación estática desde la perspectiva de quien mueve
  if (depth === 0) {
    return evaluateBoard(state.board, state.turn);
  }

  let best = -Infinity;
  for (const move of orderMoves(moves)) {
    const score = -search(applyToSearchState(state, move), depth - 1, -beta, -alpha);
    best = Math.max(best, score);
    alpha = Math.max(alpha, best);
    if (beta <= alpha) break;
  }
  return best;
}

// Nivel fácil: elige entre la mejor jugada inmediata y una aleatoria, con sesgo a la mejor
function pickGreedyMove(moves, board, color, random) {
  const scored = moves.map((move) => ({
    move,
    score: evaluateBoard(applyMoveToBoard(board, move), color),
  }));
  const bestScore = Math.max(...scored.map((entry) => entry.score));
  const bestMoves = scored.filter((entry) => entry.score === bestScore).map((e) => e.move);
  if (random() < 0.7) {
    return bestMoves[Math.floor(random() * bestMoves.length)];
  }
  return moves[Math.floor(random() * moves.length)];
}

// Elige la jugada del bot para el estado de partida y dificultad dados
export function chooseMove(game, difficulty, random = Math.random) {
  const moves = getMovesForState(createSearchState(game));
  if (moves.length === 0) return null;

  const depth = DIFFICULTY_DEPTHS[difficulty];
  if (depth <= 1) {
    return pickGreedyMove(moves, game.board, game.turn, random);
  }

  let bestScore = -Infinity;
  let bestMoves = [];
  for (const move of orderMoves(moves)) {
    const score = -search(
      applyToSearchState(createSearchState(game), move),
      depth - 1,
      -Infinity,
      Infinity,
    );
    if (score > bestScore) {
      bestScore = score;
      bestMoves = [move];
    } else if (score === bestScore) {
      bestMoves.push(move);
    }
  }
  // Pequeña variedad entre jugadas igualmente buenas
  return bestMoves[Math.floor(random() * bestMoves.length)];
}
