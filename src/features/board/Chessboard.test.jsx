import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { createInitialBoard } from '@/features/game/board.js';
import { WHITE, BLACK } from '@/features/game/constants.js';
import Chessboard from './Chessboard.jsx';

// La escena real necesita WebGL, que jsdom no proporciona: se sustituye el módulo
const createBoardSceneMock = vi.fn();
vi.mock('./scene.js', () => ({
  createBoardScene: (...args) => createBoardSceneMock(...args),
}));

// Se mockean los resizes para no depender de ResizeObserver del entorno
class MockResizeObserver {
  observe() {}
  disconnect() {}
}
globalThis.ResizeObserver = MockResizeObserver;

function setupScene() {
  const scene = {
    setBoard: vi.fn(),
    setState: vi.fn(),
    resize: vi.fn(),
    dispose: vi.fn(),
    squareMeshes: [],
  };
  createBoardSceneMock.mockReturnValue(scene);
  return scene;
}

describe('Chessboard', () => {
  beforeEach(() => {
    createBoardSceneMock.mockReset();
  });

  it('monta la escena three.js sobre un canvas', () => {
    setupScene();
    render(<Chessboard board={createInitialBoard()} turn={WHITE} onMove={vi.fn()} />);
    expect(createBoardSceneMock).toHaveBeenCalledTimes(1);
    const [canvas, options] = createBoardSceneMock.mock.calls[0];
    expect(canvas.tagName).toBe('CANVAS');
    expect(typeof options.onSquareClick).toBe('function');
  });

  it('sincroniza el tablero y los resaltes con la escena', () => {
    const scene = setupScene();
    render(<Chessboard board={createInitialBoard()} turn={WHITE} onMove={vi.fn()} />);
    expect(scene.setBoard).toHaveBeenCalledWith(createInitialBoard());
    expect(scene.setState).toHaveBeenCalled();
  });

  it('libera la escena al desmontar', () => {
    const scene = setupScene();
    const { unmount } = render(
      <Chessboard board={createInitialBoard()} turn={WHITE} onMove={vi.fn()} />,
    );
    unmount();
    expect(scene.dispose).toHaveBeenCalledTimes(1);
  });

  it('ejecuta la jugada cuando la escena notifica un clic en un destino', () => {
    setupScene();
    const onMove = vi.fn();
    render(<Chessboard board={createInitialBoard()} turn={WHITE} onMove={onMove} />);
    const { onSquareClick } = createBoardSceneMock.mock.calls[0][1];

    // Selecciona el peón de e2 y lo avanza a e4
    act(() => onSquareClick(6, 4));
    act(() => onSquareClick(4, 4));
    expect(onMove).toHaveBeenCalledTimes(1);
    const move = onMove.mock.calls[0][0];
    expect(move.from).toEqual({ row: 6, col: 4 });
    expect(move.to).toEqual({ row: 4, col: 4 });
  });

  it('bloquea la interacción cuando el tablero está deshabilitado', () => {
    setupScene();
    const onMove = vi.fn();
    render(<Chessboard board={createInitialBoard()} turn={BLACK} disabled onMove={onMove} />);
    const { onSquareClick } = createBoardSceneMock.mock.calls[0][1];
    act(() => onSquareClick(6, 4));
    expect(onMove).not.toHaveBeenCalled();
    expect(screen.getByLabelText('Tablero de ajedrez 3D')).toBeInTheDocument();
  });
});
