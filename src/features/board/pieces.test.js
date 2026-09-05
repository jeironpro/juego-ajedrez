import { describe, it, expect } from 'vitest';
import { createPieceMesh, countPieceMeshes, PIECE_HEIGHTS } from './pieces.js';
import { PIECE_TYPES } from '@/features/game/constants.js';

describe('createPieceMesh', () => {
  it('crea un grupo con mallas para cada tipo de pieza', () => {
    for (const type of Object.values(PIECE_TYPES)) {
      const group = createPieceMesh(type, 'white');
      expect(countPieceMeshes(group)).toBeGreaterThan(0);
      expect(group.isGroup).toBe(true);
    }
  });

  it('las piezas blancas y negras usan materiales distintos', () => {
    const white = createPieceMesh(PIECE_TYPES.ROOK, 'white');
    const black = createPieceMesh(PIECE_TYPES.ROOK, 'black');
    const whiteMaterial = white.children[0].material;
    const blackMaterial = black.children[0].material;
    expect(whiteMaterial).not.toBe(blackMaterial);
  });

  it('el peón es más bajo que el rey según las alturas definidas', () => {
    expect(PIECE_HEIGHTS[PIECE_TYPES.PAWN]).toBeLessThan(PIECE_HEIGHTS[PIECE_TYPES.KING]);
  });

  it('el caballo incluye la cabeza extruida además de la base', () => {
    const knight = createPieceMesh(PIECE_TYPES.KNIGHT, 'white');
    expect(countPieceMeshes(knight)).toBeGreaterThanOrEqual(2);
  });
});
