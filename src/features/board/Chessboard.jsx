import { useEffect, useMemo, useRef } from 'react';
import { getLegalMoves, isInCheck, findKing } from '@/features/game/moves.js';
import { applyMoveToBoard } from '@/features/game/apply.js';
import { useBoardSelection } from './useBoardSelection.js';
import { createBoardScene } from './scene.js';
import './Chessboard.css';

// Lee los colores del tablero desde los tokens de diseño (custom properties de CSS)
function readBoardColors() {
  const styles = getComputedStyle(document.documentElement);
  const read = (token) => {
    const value = styles.getPropertyValue(token).trim();
    return value === '' ? null : parseInt(value.replace('#', ''), 16);
  };
  return {
    boardLight: read('--color-board-light'),
    boardDark: read('--color-board-dark'),
    frame: read('--color-surface'),
    selection: read('--color-selection'),
    target: read('--color-move-hint'),
    capture: read('--color-capture-hint'),
    lastMove: read('--color-last-move'),
    check: read('--color-error'),
  };
}

// Tablero de ajedrez en 3D con three.js. Recibe el estado de la partida y el
// callback de jugada; la selección y los movimientos legales se calculan aquí.
function Chessboard({ board, turn, lastMove, disabled = false, onMove }) {
  const containerRef = useRef(null);
  const sceneRef = useRef(null);

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

  // Referencia al handler actualizado: la escena se suscribe una sola vez al montar
  // y debe leer siempre la última versión del callback (evita closures obsoletos)
  const handleSquareClickRef = useRef(handleSquareClick);
  useEffect(() => {
    handleSquareClickRef.current = handleSquareClick;
  }, [handleSquareClick]);

  // Casilla del rey en jaque (para resaltarla en rojo)
  const checkSquare = useMemo(() => {
    if (disabled) return null;
    return isInCheck(board, turn) ? findKing(board, turn) : null;
  }, [board, turn, disabled]);

  // Crea y destruye la escena three.js al montar/desmontar
  useEffect(() => {
    const canvas = document.createElement('canvas');
    containerRef.current.appendChild(canvas);
    const scene = createBoardScene(canvas, {
      colors: readBoardColors(),
      onSquareClick: (row, col) => handleSquareClickRef.current(row, col),
    });
    sceneRef.current = scene;

    const resizeObserver = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry !== undefined) {
        scene.resize(entry.contentRect.width, entry.contentRect.height);
      }
    });
    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
      scene.dispose();
      sceneRef.current = null;
      canvas.remove();
    };
  }, []);

  // Sincroniza las piezas del tablero con la escena
  useEffect(() => {
    sceneRef.current?.setBoard(board);
  }, [board]);

  // Sincroniza los resaltes (selección, destinos, última jugada y jaque)
  useEffect(() => {
    const selectedMoves = selection === null ? [] : legalMoves;
    const targets = selectedMoves
      .filter((move) => move.from.row === selection.row && move.from.col === selection.col)
      .map((move) => ({
        row: move.to.row,
        col: move.to.col,
        isCapture: move.capturedType !== null,
      }));
    sceneRef.current?.setState({
      selected: selection,
      targets,
      lastMove,
      checkSquare,
    });
  }, [selection, legalMoves, lastMove, checkSquare]);

  return (
    <div className="chessboard" ref={containerRef} aria-label="Tablero de ajedrez 3D" role="grid" />
  );
}

export default Chessboard;
