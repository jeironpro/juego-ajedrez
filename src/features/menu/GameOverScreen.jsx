import Button from '@/components/ui/Button.jsx';
import Icon from '@/components/ui/Icon.jsx';
import './GameOverScreen.css';

// Modal de fin de partida (puramente presentacional): título del resultado,
// motivo y acciones. El aviso del resultado lo gestiona la pantalla de juego.
function GameOverScreen({ title, subtitle, onRestart, onMenu }) {
  return (
    <div className="game-over" role="dialog" aria-modal="true" aria-label="Fin de partida">
      <div className="game-over__card">
        <Icon name="emoji_events" />
        <h2 className="game-over__title">{title}</h2>
        {subtitle !== '' && <p className="game-over__subtitle">{subtitle}</p>}
        <div className="game-over__actions">
          <Button icon="restart_alt" onClick={onRestart}>
            Jugar de nuevo
          </Button>
          <Button variant="secondary" onClick={onMenu}>
            Volver al menú
          </Button>
        </div>
      </div>
    </div>
  );
}

export default GameOverScreen;
