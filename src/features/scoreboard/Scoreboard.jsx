import './Scoreboard.css';

// Marcador superior: badge (dificultad/modo), nombres de los jugadores y contadores
// de victorias acumuladas; el jugador en turno queda resaltado
function Scoreboard({ player1Name, player2Name, player1Score, player2Score, badge = null, turn }) {
  const player1Active = turn === 'white';
  const player2Active = turn === 'black';
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
      <div className="scoreboard__scores">
        <span className={`scoreboard__score${player1Active ? ' scoreboard__score--active' : ''}`}>
          {player1Score}
        </span>
        <span className="scoreboard__vs">vs</span>
        <span className={`scoreboard__score${player2Active ? ' scoreboard__score--active' : ''}`}>
          {player2Score}
        </span>
      </div>
    </section>
  );
}

export default Scoreboard;
