import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App.jsx';

describe('App', () => {
  it('muestra la pantalla de inicio al arrancar', () => {
    render(<App />);
    expect(screen.getByText('Ajedrez')).toBeInTheDocument();
    expect(screen.getByText('Jugar vs Bot')).toBeInTheDocument();
  });

  it('inicia una partida contra el bot desde el inicio', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByText('Jugar vs Bot'));
    await user.click(screen.getByText('Jugar'));
    // La pantalla de juego muestra el marcador TÚ y BOT sobre el tablero
    expect(await screen.findByText('TÚ')).toBeInTheDocument();
    expect(screen.getByText('BOT')).toBeInTheDocument();
    expect(screen.getByText('Deshacer')).toBeInTheDocument();
  });

  it('vuelve al menú desde la partida', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByText('2 Jugadores'));
    await user.click(screen.getByText('Jugar'));
    await screen.findByText('Deshacer');
    await user.click(screen.getByText('Menú'));
    expect(screen.getByText('Jugar vs Bot')).toBeInTheDocument();
  });
});
