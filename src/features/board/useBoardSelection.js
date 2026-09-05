import { useState, useCallback } from 'react';

// Hook de selección del tablero 3D:
// - Un clic en una pieza propia la selecciona (o cambia la selección).
// - Un clic en un destino legal de la pieza seleccionada ejecuta la jugada.
// - Un clic en cualquier otra casilla limpia la selección.
export function useBoardSelection({ board, turn, legalMoves, disabled, onMove }) {
  const [selection, setSelection] = useState(null);

  const handleSquareClick = useCallback(
    (row, col) => {
      if (disabled) return;
      const piece = board[row][col];

      // Con una pieza seleccionada, el clic en un destino legal ejecuta la jugada
      if (selection !== null) {
        const move = legalMoves.find(
          (candidate) =>
            candidate.from.row === selection.row &&
            candidate.from.col === selection.col &&
            candidate.to.row === row &&
            candidate.to.col === col,
        );
        if (move !== undefined) {
          onMove(move);
          setSelection(null);
          return;
        }
      }

      // Selecciona la pieza propia pulsada o limpia la selección
      setSelection(piece !== null && piece.color === turn ? { row, col } : null);
    },
    [board, turn, legalMoves, disabled, selection, onMove],
  );

  return { selection, handleSquareClick };
}
