import { WHITE, BLACK } from '@/features/game/constants.js';
import './Scoreboard.css';

// Marcador superior: badge (dificultad/modo), nombres de los jugadores y piezas
// restantes de cada uno (16 al inicio, descuentan al capturar); el jugador en
// turno queda resaltado
function Scoreboard({
  player1Name,
  player2Name,
  player1Pieces = 16,
  player2Pieces = 16,
  badge = null,
  turn,
}) {
  const player1Active = turn === WHITE;
  const player2Active = turn === BLACK;
  return (
    <section className="scoreboard" aria-label="Marcador de la partida">
      {badge !== null && (
        <div className="scoreboard__top-row">
          <span className="scoreboard__badge">{badge}</span>
        </div>
      )}
      <div className="scoreboard__names">
        <span className={`scoreboard__name${player1Active ? ' scoreboard__name--active' : ''}`}>
          {player1Name}
        </span>
        <span className={`scoreboard__name${player2Active ? ' scoreboard__name--active' : ''}`}>
          {player2Name}
        </span>
      </div>
      <div className="scoreboard__counts">
        <span className={`scoreboard__count${player1Active ? ' scoreboard__count--active' : ''}`}>
          {player1Pieces}
        </span>
        <span className="scoreboard__vs">vs</span>
        <span className={`scoreboard__count${player2Active ? ' scoreboard__count--active' : ''}`}>
          {player2Pieces}
        </span>
      </div>
    </section>
  );
}

export default Scoreboard;
