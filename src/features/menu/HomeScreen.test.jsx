import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import HomeScreen from './HomeScreen.jsx';

describe('HomeScreen', () => {
  it('muestra el título y los modos de juego', () => {
    render(<HomeScreen onStart={vi.fn()} />);
    expect(screen.getByText('Ajedrez')).toBeInTheDocument();
    expect(screen.getByText('Jugar vs Bot')).toBeInTheDocument();
    expect(screen.getByText('2 Jugadores')).toBeInTheDocument();
  });

  it('no permite jugar sin elegir un modo', () => {
    render(<HomeScreen onStart={vi.fn()} />);
    expect(screen.getByText('Jugar')).toBeDisabled();
  });

  it('muestra la dificultad al elegir el modo bot y permite jugar', async () => {
    const onStart = vi.fn();
    const user = userEvent.setup();
    render(<HomeScreen onStart={onStart} />);
    await user.click(screen.getByText('Jugar vs Bot'));
    expect(screen.getByText('Fácil')).toBeInTheDocument();
    expect(screen.getByText('Medio')).toBeInTheDocument();
    expect(screen.getByText('Difícil')).toBeInTheDocument();

    await user.click(screen.getByText('Difícil'));
    await user.click(screen.getByText('Jugar'));
    expect(onStart).toHaveBeenCalledWith('bot', 'dificil');
  });

  it('arranca el modo local sin dificultad', async () => {
    const onStart = vi.fn();
    const user = userEvent.setup();
    render(<HomeScreen onStart={onStart} />);
    await user.click(screen.getByText('2 Jugadores'));
    await user.click(screen.getByText('Jugar'));
    expect(onStart).toHaveBeenCalledWith('local', expect.anything());
  });
});
