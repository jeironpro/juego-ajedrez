// Helpers compartidos por los tests del motor y de la interfaz: buscan y aplican
// jugadas por su notación algebraica simplificada (p. ej. "e2e4").
import { applyMove } from '@/features/game/game.js';
import { getLegalMoves, moveKey } from '@/features/game/moves.js';
import { applyMoveToBoard } from '@/features/game/apply.js';

// Movimientos legales del turno, con los metadatos de la partida necesarios
export function getGameLegalMoves(game) {
  return getLegalMoves(game.board, game.turn, {
    castlingRights: game.castlingRights,
    enPassantTarget: game.enPassantTarget,
    applyMoveToBoardFn: applyMoveToBoard,
  });
}

// Busca un movimiento por su notación origen-destino entre los legales del turno
export function findMove(game, notation) {
  return getGameLegalMoves(game).find((move) => moveKey(move) === notation);
}

// Aplica una jugada buscándola por notación
export function play(game, notation) {
  const move = findMove(game, notation);
  if (move === undefined) throw new Error(`Movimiento no legal: ${notation}`);
  return applyMove(game, move);
}
