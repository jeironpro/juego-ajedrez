import { describe, it, expect } from 'vitest';
import { createBoardGroup, syncPieces, updateHighlights, BOARD_SIZE } from './scene.js';
import { createInitialBoard, createEmptyBoard } from '@/features/game/board.js';

describe('createBoardGroup', () => {
  it('crea 64 casillas con su marco', () => {
    const boardGroup = createBoardGroup({});
    expect(boardGroup.squareMeshes).toHaveLength(BOARD_SIZE * BOARD_SIZE);
    expect(boardGroup.group).toBeDefined();
  });

  it('posiciona las casillas en el plano del tablero', () => {
    const boardGroup = createBoardGroup({});
    const first = boardGroup.squareMeshes[0];
    expect(Math.abs(first.mesh.position.x)).toBeLessThanOrEqual(BOARD_SIZE / 2);
    expect(Math.abs(first.mesh.position.z)).toBeLessThanOrEqual(BOARD_SIZE / 2);
  });
});

describe('syncPieces', () => {
  it('añade una malla por cada pieza de la posición inicial', () => {
    const boardGroup = createBoardGroup({});
    syncPieces(boardGroup.piecesGroup, createInitialBoard());
    expect(boardGroup.piecesGroup.children).toHaveLength(32);
  });

  it('vacía el grupo cuando el tablero no tiene piezas', () => {
    const boardGroup = createBoardGroup({});
    syncPieces(boardGroup.piecesGroup, createInitialBoard());
    syncPieces(boardGroup.piecesGroup, createEmptyBoard());
    expect(boardGroup.piecesGroup.children).toHaveLength(0);
  });
});

describe('updateHighlights', () => {
  it('muestra la selección solo cuando hay una pieza seleccionada', () => {
    const boardGroup = createBoardGroup({});
    const { selection } = boardGroup.highlights;
    expect(selection.visible).toBe(false);

    updateHighlights(boardGroup.highlights, {
      selected: { row: 7, col: 4 },
      targets: [],
      lastMove: null,
      checkSquare: null,
    });
    expect(selection.visible).toBe(true);

    updateHighlights(boardGroup.highlights, {
      selected: null,
      targets: [],
      lastMove: null,
      checkSquare: null,
    });
    expect(selection.visible).toBe(false);
  });

  it('reparte puntos y anillos según el tipo de destino', () => {
    const boardGroup = createBoardGroup({});
    const { targetPool, capturePool } = boardGroup.highlights;

    updateHighlights(boardGroup.highlights, {
      selected: { row: 4, col: 4 },
      targets: [
        { row: 4, col: 5, isCapture: false },
        { row: 3, col: 3, isCapture: true },
      ],
      lastMove: null,
      checkSquare: null,
    });

    expect(targetPool[0].visible).toBe(true);
    expect(targetPool[1].visible).toBe(false);
    expect(capturePool[0].visible).toBe(true);
    expect(capturePool[1].visible).toBe(false);
  });

  it('resalta la casilla del rey en jaque', () => {
    const boardGroup = createBoardGroup({});
    const { check } = boardGroup.highlights;
    expect(check.visible).toBe(false);

    updateHighlights(boardGroup.highlights, {
      selected: null,
      targets: [],
      lastMove: null,
      checkSquare: { row: 7, col: 4 },
    });
    expect(check.visible).toBe(true);
  });
});
