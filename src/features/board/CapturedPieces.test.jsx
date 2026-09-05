import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BLACK, WHITE, PIECE_TYPES } from '@/features/game/constants.js';
import CapturedPieces from './CapturedPieces.jsx';

describe('CapturedPieces', () => {
  it('ordena las capturas de mayor a menor valor material', () => {
    render(
      <CapturedPieces
        ownerName="TÚ"
        pieces={[
          { type: PIECE_TYPES.PAWN, color: BLACK },
          { type: PIECE_TYPES.QUEEN, color: BLACK },
          { type: PIECE_TYPES.ROOK, color: BLACK },
        ]}
      />,
    );
    expect(
      screen.getByLabelText('Piezas capturadas por TÚ: dama, torre, peón'),
    ).toBeInTheDocument();
  });

  it('no se renderiza cuando no hay capturas', () => {
    const { container } = render(<CapturedPieces ownerName="TÚ" pieces={[]} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('muestra las piezas con el color del bando que las perdió', () => {
    render(
      <CapturedPieces ownerName="BOT" pieces={[{ type: PIECE_TYPES.KNIGHT, color: WHITE }]} />,
    );
    const region = screen.getByLabelText('Piezas capturadas por BOT: caballo');
    expect(region.querySelector('.piece--white')).not.toBeNull();
  });
});
