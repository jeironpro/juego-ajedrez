import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import GameOverScreen from './GameOverScreen.jsx';

describe('GameOverScreen', () => {
  it('muestra el título y el motivo del final', () => {
    render(
      <GameOverScreen
        title="¡Ganaste!"
        subtitle="Jaque mate"
        onRestart={vi.fn()}
        onMenu={vi.fn()}
      />,
    );
    expect(screen.getByText('¡Ganaste!')).toBeInTheDocument();
    expect(screen.getByText('Jaque mate')).toBeInTheDocument();
  });

  it('permite reiniciar o volver al menú', async () => {
    const onRestart = vi.fn();
    const onMenu = vi.fn();
    const user = userEvent.setup();
    render(<GameOverScreen title="¡Ganaste!" subtitle="" onRestart={onRestart} onMenu={onMenu} />);
    await user.click(screen.getByText('Jugar de nuevo'));
    expect(onRestart).toHaveBeenCalledTimes(1);
    await user.click(screen.getByText('Volver al menú'));
    expect(onMenu).toHaveBeenCalledTimes(1);
  });
});
