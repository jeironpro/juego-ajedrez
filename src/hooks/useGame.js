import { useEffect, useRef, useCallback, useState } from 'react';
import { createGame, applyMove, undoMove } from '@/features/game/game.js';
import { chooseMove } from '@/features/bot/bot.js';
import { BLACK } from '@/features/game/constants.js';

// Pausa para que se aprecie la jugada del bot y el turno se siga cómodamente
const BOT_DELAY_MS = 1500;

// Estado de la partida: movimientos, deshacer (una vez por partida) y reinicio.
// Si se pasa botDifficulty, el bot (jugador negro) responde automáticamente.
export function useGame({ botDifficulty = null } = {}) {
  const [game, setGame] = useState(() => createGame());
  const botTimerRef = useRef(null);

  useEffect(() => {
    if (botDifficulty === null || game.over || game.turn !== BLACK) return;
    if (botTimerRef.current !== null) return;
    // Se programa la jugada del bot; si el estado cambia antes (deshacer), se cancela
    botTimerRef.current = setTimeout(() => {
      botTimerRef.current = null;
      setGame((current) => {
        const move = chooseMove(current, botDifficulty);
        return move === null ? current : applyMove(current, move);
      });
    }, BOT_DELAY_MS);
    return () => {
      if (botTimerRef.current !== null) {
        clearTimeout(botTimerRef.current);
        botTimerRef.current = null;
      }
    };
  }, [game, botDifficulty]);

  const makeMove = useCallback((move) => {
    setGame((current) => applyMove(current, move));
  }, []);

  const undo = useCallback(() => {
    setGame((current) => {
      // En modo bot se revierte también la respuesta del bot (turno completo)
      const plies = botDifficulty === null ? 1 : Math.min(2, current.history.length);
      return undoMove(current, plies);
    });
  }, [botDifficulty]);

  const restart = useCallback(() => {
    setGame(createGame());
  }, []);

  return { game, makeMove, undo, restart };
}
