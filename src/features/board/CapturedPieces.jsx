import Piece from './Piece.jsx';
import { sortCapturedPieces, PIECE_NAMES } from './glyphs.js';
import './CapturedPieces.css';

// Bandeja lateral que muestra, junto al jugador que las ha comido, las piezas
// rivales capturadas (de mayor a menor valor material). Se oculta si está vacía.
function CapturedPieces({ pieces, ownerName }) {
  if (pieces.length === 0) return null;

  const ordered = sortCapturedPieces(pieces);
  const summary = ordered.map((piece) => PIECE_NAMES[piece.type]).join(', ');
  return (
    <div
      className="captured-pieces"
      role="region"
      aria-label={`Piezas capturadas por ${ownerName}: ${summary}`}
    >
      {ordered.map((piece, index) => (
        <Piece
          key={`${piece.type}-${piece.color}-${index}`}
          type={piece.type}
          color={piece.color}
          className="captured-pieces__item"
        />
      ))}
    </div>
  );
}

export default CapturedPieces;
