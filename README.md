# Juego de Ajedrez

## Descripción

Juego de **ajedrez** completo (reglas estándar) implementado como aplicación web. Se puede jugar
de dos maneras:

- **Contra el bot** (implementado en JavaScript puro con búsqueda negamax y poda alfa-beta) en
  tres niveles: Fácil, Medio y Difícil.
- **Dos jugadores en el mismo tablero** (hot-seat), turno alternado.

Sobre el tablero se muestra un **scoreboard** con los contadores de victorias de cada jugador
(TÚ / BOT), un botón **Deshacer** que permite revertir una sola jugada por partida y botones para
**reiniciar** la partida o **volver al menú**. Cuando un jugador captura una pieza, esta aparece
en la **bandeja lateral de su lado**, y el jaque se resalta en rojo sobre el rey atacado.

## Reglas del juego

- Tablero 8×8 con la posición inicial estándar; el jugador blanco (TÚ) abre la partida.
- Reglas completas: movimiento legal de todas las piezas, **enroque** (corto y largo), **captura
  al paso** y **coronación** del peón al llegar a la última fila (a dama por defecto).
- Detección de **jaque**, **jaque mate** y **ahogado**, además de tablas por **regla de los 50
  movimientos**, **triple repetición** y **material insuficiente**.
- El bot (jugador negro) analiza la posición con búsqueda negamax y poda alfa-beta; su
  profundidad depende de la dificultad elegida.

## Stack

| Tecnología               | Uso                                                |
| ------------------------ | -------------------------------------------------- |
| React 19                 | Interfaz de usuario (SPA)                          |
| Vite 8                   | Bundler y dev server                               |
| Yarn 4                   | Gestor de paquetes (fijado en `packageManager`)    |
| Vitest + Testing Library | Tests unitarios y de componentes                   |
| ESLint + Prettier        | Lint y formato (Husky + lint-staged en pre-commit) |
| GitHub Actions           | CI: lint, tests y build por PR                     |

## Cómo correr

Requisitos: Node.js 24 (ver `.nvmrc`) y Yarn 4.

```bash
yarn install     # instala dependencias
yarn dev         # servidor de desarrollo (http://localhost:5173)
yarn build       # build de producción en dist/
yarn preview     # sirve el build localmente
yarn test        # ejecuta los tests (Vitest)
yarn lint        # ejecuta ESLint
yarn format      # formatea el código con Prettier
```

## Estructura del proyecto

```
src/
  components/ui/        # componentes genéricos (Button, Icon)
  features/game/        # motor de ajedrez en JS puro (board, moves, game) + tests
  features/bot/         # bot en JS puro (negamax + alfa-beta) y dificultades
  features/board/       # tablero 2D, piezas, bandejas de capturas y selección
  features/scoreboard/  # marcador superior con contadores de victorias
  features/menu/        # pantalla de inicio y fin de partida
  hooks/                # useGame (estado de partida y turno del bot)
  styles/               # tokens de diseño y estilos base
docs/
  style-guide.md        # libro de estilo (colores, tipografía, componentes)
```

El motor de reglas y el bot son **JavaScript puro** (sin dependencias), lo que los hace
independientes de la interfaz y fáciles de testear.

## Diseño

La dirección visual es clara y minimalista, inspirada en la estética de
[berd.xyz](https://berd.xyz/). Todos los valores visuales (paleta, tipografía, espaciados,
radios, sombras) están definidos en el [libro de estilo](docs/style-guide.md) y materializados
como _custom properties_ en `src/styles/tokens.css`. Las piezas se dibujan con glifos Unicode y
los iconos usan la librería **Material Symbols** de Google.

## Calidad

- **Tests**: 109 tests entre el motor de reglas, el bot, hooks y componentes (`yarn test`).
- **CI**: pipeline en `.github/workflows/ci.yml` que ejecuta lint, tests y build en cada pull
  request y push a `main`.
- **Pre-commit**: Husky + lint-staged aplican ESLint y Prettier sobre los archivos modificados.

## Licencia

Este proyecto está bajo la licencia **MIT**. Consulta el archivo [LICENSE](LICENSE) para más
detalles.
