import { describe, it, expect, vi, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useGame } from './useGame.js';
import { createGame, applyMove } from '@/features/game/game.js';
import { getLegalMoves } from '@/features/game/moves.js';
import { applyMoveToBoard } from '@/features/game/apply.js';
import { WHITE, BLACK } from '@/features/game/constants.js';

// Primera jugada legal de la posición dada
function firstMove(game) {
  return getLegalMoves(game.board, game.turn, {
    castlingRights: game.castlingRights,
    enPassantTarget: game.enPassantTarget,
    applyMoveToBoardFn: applyMoveToBoard,
  })[0];
}

afterEach(() => {
  vi.useRealTimers();
});

describe('useGame', () => {
  it('aplica una jugada y cambia el turno', () => {
    const { result } = renderHook(() => useGame({}));
    act(() => result.current.makeMove(firstMove(result.current.game)));
    expect(result.current.game.turn).toBe(BLACK);
    expect(result.current.game.history).toHaveLength(1);
  });

  it('deshace una jugada (una vez por partida)', () => {
    const { result } = renderHook(() => useGame({}));
    act(() => result.current.makeMove(firstMove(result.current.game)));
    act(() => result.current.undo());
    expect(result.current.game.turn).toBe(WHITE);
    expect(result.current.game.undoUsed).toBe(true);
  });

  it('reinicia la partida por completo', () => {
    const { result } = renderHook(() => useGame({}));
    act(() => result.current.makeMove(firstMove(result.current.game)));
    act(() => result.current.restart());
    expect(result.current.game.turn).toBe(WHITE);
    expect(result.current.game.history).toHaveLength(0);
  });

  it('el bot responde automáticamente después de la pausa', () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useGame({ botDifficulty: 'medio' }));
    act(() => result.current.makeMove(firstMove(result.current.game)));
    // El bot (negras) debe pensar tras 1500ms
    expect(result.current.game.turn).toBe(BLACK);
    act(() => vi.advanceTimersByTime(1500));
    expect(result.current.game.turn).toBe(WHITE);
    expect(result.current.game.history).toHaveLength(2);
  });

  it('el deshacer en modo bot revierte también la respuesta del bot', () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useGame({ botDifficulty: 'medio' }));
    act(() => result.current.makeMove(firstMove(result.current.game)));
    act(() => vi.advanceTimersByTime(1500));
    expect(result.current.game.turn).toBe(WHITE);
    expect(result.current.game.history).toHaveLength(2);

    act(() => result.current.undo());
    expect(result.current.game.turn).toBe(WHITE);
    expect(result.current.game.history).toHaveLength(0);
    expect(result.current.game.undoUsed).toBe(true);
  });

  it('reiniciar cancela la jugada pendiente del bot', () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useGame({ botDifficulty: 'medio' }));
    act(() => result.current.makeMove(firstMove(result.current.game)));
    act(() => result.current.restart());
    act(() => vi.advanceTimersByTime(1500));
    expect(result.current.game.turn).toBe(WHITE);
    expect(result.current.game.history).toHaveLength(0);
  });

  it('mantiene el estado inmutable: las jugadas generan estados nuevos', () => {
    const { result } = renderHook(() => useGame({}));
    const initial = result.current.game;
    act(() => result.current.makeMove(firstMove(result.current.game)));
    expect(result.current.game).not.toBe(initial);
    expect(initial.history).toHaveLength(0);
  });
});

// Helper de referencia para construir partidas en otros tests
export function gameAfterFirstMove() {
  const game = createGame();
  const move = getLegalMoves(game.board, game.turn, {
    castlingRights: game.castlingRights,
    enPassantTarget: game.enPassantTarget,
    applyMoveToBoardFn: applyMoveToBoard,
  })[0];
  return applyMove(game, move);
}
