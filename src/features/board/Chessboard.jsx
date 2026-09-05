import { useMemo } from 'react';
import { BOARD_SIZE, WHITE } from '@/features/game/constants.js';
import { toAlgebraic } from '@/features/game/board.js';
import { getLegalMoves, isInCheck, findKing } from '@/features/game/moves.js';
import { applyMoveToBoard } from '@/features/game/apply.js';
import { useBoardSelection } from './useBoardSelection.js';
import Piece from './Piece.jsx';
import { PIECE_NAMES } from './glyphs.js';
import './Chessboard.css';

// Marca una casilla como casilla clara u oscura: a1 (fila 7) es oscura en ajedrez
function isLightSquare(row, col) {
  return (row + col) % 2 === 1;
}

// Texto accesible de una casilla: coordenadas y pieza que la ocupa, si la hay
function squareLabel(row, col, piece) {
  const coordinates = toAlgebraic(row, col);
  if (piece === null) return coordinates;
  const colorName = piece.color === WHITE ? 'blanco' : 'negro';
  return `${coordinates}, ${PIECE_NAMES[piece.type]} ${colorName}`;
}

// Tablero de ajedrez en HTML y CSS: casillas clicables con selección, destinos
// legales, última jugada y resaltado del jaque
function Chessboard({ board, turn, lastMove = null, disabled = false, onMove }) {
  // Movimientos legales del turno, usados para la selección y los resaltes
  const legalMoves = useMemo(
    () => (disabled ? [] : getLegalMoves(board, turn, { applyMoveToBoardFn: applyMoveToBoard })),
    [board, turn, disabled],
  );

  const { selection, handleSquareClick } = useBoardSelection({
    board,
    turn,
    legalMoves,
    disabled,
    onMove,
  });

  // La selección solo cuenta si la casilla aún guarda una pieza del jugador en turno;
  // así se descarta sola tras deshacer, reiniciar o mover el rival
  const selectedPiece = selection !== null ? (board[selection.row]?.[selection.col] ?? null) : null;
  const activeSelection = selectedPiece !== null && selectedPiece.color === turn ? selection : null;

  // Destinos legales de la pieza seleccionada, clasificados por captura o no
  const selectionMoves = useMemo(() => {
    if (activeSelection === null) return [];
    return legalMoves.filter(
      (move) => move.from.row === activeSelection.row && move.from.col === activeSelection.col,
    );
  }, [legalMoves, activeSelection]);

  const targetKeys = useMemo(() => {
    const keys = new Set();
    const captures = new Set();
    for (const move of selectionMoves) {
      const key = `${move.to.row},${move.to.col}`;
      keys.add(key);
      if (move.capturedType !== null) captures.add(key);
    }
    return { keys, captures };
  }, [selectionMoves]);

  // Casilla del rey en jaque (se resalta en rojo)
  const checkSquare = useMemo(() => {
    if (disabled) return null;
    return isInCheck(board, turn) ? findKing(board, turn) : null;
  }, [board, turn, disabled]);

  const checkKey = checkSquare !== null ? `${checkSquare.row},${checkSquare.col}` : null;

  const squares = Array.from({ length: BOARD_SIZE }, (_, row) =>
    Array.from({ length: BOARD_SIZE }, (_, col) => {
      const piece = board[row][col];
      const key = `${row},${col}`;
      const selected =
        activeSelection !== null && activeSelection.row === row && activeSelection.col === col;
      const isTarget = targetKeys.keys.has(key);
      const isCapture = targetKeys.captures.has(key);
      const isLastMove =
        (lastMove !== null && lastMove.from.row === row && lastMove.from.col === col) ||
        (lastMove !== null && lastMove.to.row === row && lastMove.to.col === col);
      const isCheck = checkKey === key;

      const markers = [];
      if (isLastMove)
        markers.push(<span key="last" className="board__marker board__marker--last-move" />);
      if (isCheck)
        markers.push(<span key="check" className="board__marker board__marker--check" />);
      if (selected)
        markers.push(<span key="selected" className="board__marker board__marker--selection" />);

      const className = [
        'board__square',
        isLightSquare(row, col) ? 'board__square--light' : 'board__square--dark',
      ]
        .filter(Boolean)
        .join(' ');

      return (
        <button
          key={key}
          type="button"
          className={className}
          onClick={() => handleSquareClick(row, col)}
          disabled={disabled}
          aria-label={squareLabel(row, col, piece)}
          aria-pressed={selected}
        >
          {markers}
          {piece !== null && <Piece type={piece.type} color={piece.color} />}
          {isTarget && (
            <span
              className={`board__marker board__marker--target${
                isCapture ? ' board__marker--capture' : ' board__marker--dot'
              }`}
              aria-hidden="true"
            />
          )}
        </button>
      );
    }),
  ).flat();

  return (
    <div className="chessboard" role="grid" aria-label="Tablero de ajedrez">
      {squares}
    </div>
  );
}

export default Chessboard;
