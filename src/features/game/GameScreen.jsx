import Button from '@/components/ui/Button.jsx';
import Scoreboard from '@/features/scoreboard/Scoreboard.jsx';
import Chessboard from '@/features/board/Chessboard.jsx';
import CapturedPieces from '@/features/board/CapturedPieces.jsx';
import GameOverScreen from '@/features/menu/GameOverScreen.jsx';
import { countPieces } from '@/features/game/board.js';
import { WHITE, BLACK } from '@/features/game/constants.js';
import { GAME_END_REASONS } from '@/features/game/constants.js';
import './GameScreen.css';

// Pantalla de partida: marcador arriba, tablero con las bandejas de capturas en
// los laterales de cada jugador y controles debajo. Con botMode activo, el tablero
// se bloquea mientras piensa el bot (jugador negro)
function GameScreen({
  game,
  onMove,
  onUndo,
  onRestart,
  onMenu,
  player1Name = 'TÚ',
  player2Name = 'BOT',
  badge = null,
  botMode = false,
}) {
  // Piezas comidas por cada jugador: el bando 1 (blancas) acumula piezas negras
  const player1Captures = game.capturedPieces.filter((piece) => piece.color === BLACK);
  const player2Captures = game.capturedPieces.filter((piece) => piece.color === WHITE);
  // Piezas restantes de cada bando: 16 al inicio, descuentan al capturar
  const player1Pieces = countPieces(game.board, WHITE);
  const player2Pieces = countPieces(game.board, BLACK);
  const botTurn = botMode && game.turn === BLACK && !game.over;
  const undoDisabled = botTurn || game.undoUsed || game.history.length === 0 || game.over;

  // Aviso de que el bot está pensando (el jaque se resalta en el tablero)
  const status = botTurn ? 'El bot está pensando…' : null;

  const winnerName =
    game.winner === WHITE ? player1Name : game.winner === BLACK ? player2Name : null;
  const overTitle = botMode
    ? game.winner === WHITE
      ? '¡Ganaste!'
      : '¡El bot ganó!'
    : winnerName !== null
      ? `¡${winnerName} gana!`
      : '¡Tablas!';

  return (
    <div className="game-screen">
      <div className="game-screen__score">
        <Scoreboard
          player1Name={player1Name}
          player2Name={player2Name}
          player1Pieces={player1Pieces}
          player2Pieces={player2Pieces}
          badge={badge}
          turn={game.turn}
        />
      </div>
      <div className="game-screen__side game-screen__side--left">
        <CapturedPieces pieces={player1Captures} ownerName={player1Name} />
      </div>
      <div className="game-screen__board">
        <Chessboard
          board={game.board}
          turn={game.turn}
          lastMove={game.lastMove}
          disabled={game.over || botTurn}
          onMove={onMove}
        />
      </div>
      <div className="game-screen__side game-screen__side--right">
        <CapturedPieces pieces={player2Captures} ownerName={player2Name} />
      </div>
      <div className="game-screen__controls">
        {status !== null && (
          <p className="game-screen__status" role="status">
            {status}
          </p>
        )}
        <div className="game-screen__actions">
          <Button variant="secondary" icon="undo" onClick={onUndo} disabled={undoDisabled}>
            Deshacer
          </Button>
          <Button variant="secondary" icon="restart_alt" onClick={onRestart}>
            Reiniciar
          </Button>
          <Button variant="secondary" icon="arrow_back" onClick={onMenu}>
            Menú
          </Button>
        </div>
      </div>
      {game.over && (
        <GameOverScreen
          title={overTitle}
          subtitle={endReasonText(game.endReason)}
          onRestart={onRestart}
          onMenu={onMenu}
        />
      )}
    </div>
  );
}

// Texto legible del motivo de finalización
function endReasonText(reason) {
  switch (reason) {
    case GAME_END_REASONS.CHECKMATE:
      return 'Jaque mate';
    case GAME_END_REASONS.STALEMATE:
      return 'Ahogado: no hay movimientos legales';
    case GAME_END_REASONS.INSUFFICIENT_MATERIAL:
      return 'Material insuficiente para dar mate';
    case GAME_END_REASONS.FIFTY_MOVE_RULE:
      return 'Regla de los 50 movimientos';
    case GAME_END_REASONS.THREEFOLD_REPETITION:
      return 'Repetición de posición';
    default:
      return '';
  }
}

export default GameScreen;
