import { PIECE_GLYPHS } from './glyphs.js';

// Pieza del tablero 2D: un glifo Unicode decorativo (la casilla aporta la
// etiqueta accesible, por eso se oculta de la accesibilidad)
function Piece({ type, color, className = '' }) {
  const classes = ['piece', `piece--${color}`, className].filter(Boolean).join(' ');
  return (
    <span className={classes} aria-hidden="true">
      {PIECE_GLYPHS[color][type]}
    </span>
  );
}

export default Piece;
