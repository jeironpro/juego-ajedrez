import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from './App.jsx';

// Test de humo del scaffold: verifica que la aplicación arranca y renderiza
describe('App', () => {
  it('renderiza la pantalla de arranque', () => {
    render(<App />);
    expect(screen.getByText('Ajedrez')).toBeInTheDocument();
  });
});
