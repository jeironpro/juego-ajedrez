# Libro de estilo — Juego de Ajedrez

## Propósito

Este documento define el sistema de diseño del juego de ajedrez. Es la única fuente de verdad para
colores, tipografía, espaciados y componentes base: cualquier valor visual nuevo debe derivarse de
aquí y materializarse como _custom property_ de CSS en `src/styles/tokens.css`.

La dirección visual toma como referencia la estética de [berd.xyz](https://berd.xyz/): superficies
planas y neutras, tipografía Inter cuidada, botones totalmente redondeados (`rounded-full`), radios
suaves en cards, color usado solo para comunicar estado y una jerarquía tipográfica tranquila.

## 1. Paleta de colores

### Neutros y fondo

| Token                      | Hex       | Uso                                   |
| -------------------------- | --------- | ------------------------------------- |
| `--color-bg`               | `#FAFAFA` | Fondo general de la aplicación        |
| `--color-surface`          | `#FFFFFF` | Cards, paneles y superficies elevadas |
| `--color-muted`            | `#F0F0F0` | Badges, chips y controles sutiles     |
| `--color-text-primary`     | `#242424` | Texto principal (títulos, cuerpo)     |
| `--color-text-secondary`   | `#7F7F7F` | Texto secundario (subtítulos, ayudas) |
| `--color-text-placeholder` | `#CCCCCC` | Texto de marcador en inputs           |
| `--color-border`           | `#E8E8E8` | Bordes de cards, inputs y divisores   |

### Color de acento (primario)

| Token                        | Hex       | Uso                                   |
| ---------------------------- | --------- | ------------------------------------- |
| `--color-primary`            | `#242424` | Botones principales, foco y selección |
| `--color-primary-hover`      | `#3D3D3D` | Hover de elementos primarios          |
| `--color-primary-active`     | `#1A1A1A` | Estado activo/pulsado                 |
| `--color-primary-foreground` | `#FFFFFF` | Texto sobre el color primario         |

> Regla de berd.xyz: los colores de estado (rojo, verde, azul, ámbar) comunican estado, nunca
> decoración. Si un color no comunica nada, se elimina.

### Estados de feedback

| Token             | Hex       | Uso                                       |
| ----------------- | --------- | ----------------------------------------- |
| `--color-success` | `#73B468` | Éxito (victorias, mensajes positivos)     |
| `--color-error`   | `#DC2626` | Error (jugadas inválidas, jaque, derrota) |
| `--color-warning` | `#FBCD44` | Advertencia (avisos, confirmaciones)      |
| `--color-info`    | `#5C98F9` | Información (jugadas del bot, ayudas)     |

### Tablero y piezas

| Token                        | Hex       | Uso                                   |
| ---------------------------- | --------- | ------------------------------------- |
| `--color-board-light`        | `#EFEAE4` | Casillas claras del tablero           |
| `--color-board-dark`         | `#B9AC98` | Casillas oscuras del tablero          |
| `--color-piece-white`        | `#F5F4F2` | Piezas blancas                        |
| `--color-piece-white-border` | `#D8D3CB` | Detalles/ borde de las piezas blancas |
| `--color-piece-black`        | `#2E2B28` | Piezas negras                         |
| `--color-piece-black-border` | `#1C1A18` | Detalles/ borde de las piezas negras  |
| `--color-selection`          | `#5C98F9` | Resalte de la pieza seleccionada      |
| `--color-move-hint`          | `#73B468` | Puntos de destino de jugadas legales  |
| `--color-last-move`          | `#FBCD44` | Resalte de la última jugada           |
| `--color-capture-hint`       | `#DC2626` | Anillo de pieza capturable            |

Las capturas de cada jugador se muestran como glifos reducidos en una bandeja pegada al lateral
correspondiente del tablero.

## 2. Tipografía

- **Familia**: `Inter` (Google Fonts) con fallback `system-ui, -apple-system, sans-serif`.
  Se carga en `index.html`; el token es `--font-family-base`.
- **Jerarquía**:

| Nivel     | Token                  | Tamaño          | Peso | Uso                             |
| --------- | ---------------------- | --------------- | ---- | ------------------------------- |
| Display   | `--font-size-display`  | 32px / 2rem     | 800  | Título principal de pantallas   |
| Título    | `--font-size-title`    | 24px / 1.5rem   | 700  | Títulos de sección              |
| Subtítulo | `--font-size-subtitle` | 18px / 1.125rem | 600  | Subtítulos, nombres de jugador  |
| Cuerpo    | `--font-size-body`     | 16px / 1rem     | 400  | Texto general                   |
| Label     | `--font-size-label`    | 14px / 0.875rem | 500  | Etiquetas de campos y controles |
| Caption   | `--font-size-caption`  | 12px / 0.75rem  | 400  | Ayudas, metadatos               |

- Pesos disponibles: 400 (regular), 500 (medium), 600 (semibold), 700 (bold), 800 (extrabold).
- Interlineado de títulos: 1.2; de cuerpo: 1.5.

## 3. Espaciado y grilla

- **Escala de espaciado** (base 4px):

| Token             | Valor |
| ----------------- | ----- |
| `--spacing-xs`    | 4px   |
| `--spacing-sm`    | 8px   |
| `--spacing-md`    | 12px  |
| `--spacing-lg`    | 16px  |
| `--spacing-xl`    | 24px  |
| `--spacing-xxl`   | 32px  |
| `--spacing-xxxl`  | 48px  |
| `--spacing-xxxxl` | 64px  |

- **Grilla**: los paneles y pantallas se maquetan con esta escala; el tablero usa su propia grilla
  interna (8×8) que se escala con el contenedor.
- **Breakpoints** (mobile-first, media queries `min-width`):

| Breakpoint | Valor  |
| ---------- | ------ |
| `sm`       | 640px  |
| `md`       | 768px  |
| `lg`       | 1024px |

> Nota: los breakpoints se documentan como tokens para referencia, pero las media queries usan el
> valor literal (`@media (min-width: 768px)`), porque CSS no permite `var()` dentro de media queries.

## 4. Radios, sombras y elevación

| Token           | Valor                          | Uso                            |
| --------------- | ------------------------------ | ------------------------------ |
| `--radius-sm`   | 6px                            | Chips, elementos anidados      |
| `--radius-md`   | 12px                           | Cards pequeñas, inputs         |
| `--radius-lg`   | 18px                           | Cards, paneles, modales        |
| `--radius-full` | 9999px                         | Botones, píldoras, avatares    |
| `--shadow-sm`   | `0 2px 8px rgb(0 0 0 / 0.15)`  | Afordancia de controles        |
| `--shadow-md`   | `0 3px 12px rgb(0 0 0 / 0.22)` | Cards en hover                 |
| `--shadow-lg`   | `0 8px 30px rgb(0 0 0 / 0.12)` | Popovers y elementos flotantes |
| `--shadow-xl`   | `0 20px 60px rgb(0 0 0 / 0.2)` | Modales                        |

> Regla de berd.xyz («Flat first»): las superficies son planas en reposo; las sombras aparecen
> en hover, diálogos y overlays donde la profundidad aclara el apilado.

## 5. Componentes base

### Botones

- **Forma**: todos los botones usan `--radius-full` (píldora), como en berd.xyz.
- **Primario**: fondo `--color-primary`, texto `--color-primary-foreground`, altura mínima 44px.
  - _hover_: fondo `--color-primary-hover`.
  - _active_: fondo `--color-primary-active`.
  - _disabled_: opacidad 0.5, cursor `not-allowed`.
- **Secundario**: fondo `--color-surface`, borde `--color-border`, texto `--color-text-primary`.
  - _hover_: borde `--color-text-primary`.
- Todos los botones muestran anillo de foco `--focus-ring` en `:focus-visible`.

### Cards

- Fondo `--color-surface`, radio `--radius-lg`, borde `--color-border`, padding `--spacing-xl`.
- Sombra en reposo solo si la card es interactiva (`--shadow-sm`).

### Badges y chips

- Fondo `--color-muted`, texto `--color-text-primary`, radio `--radius-sm` (difieren de los botones
  a propósito: un badge es una etiqueta estática, no un control).

### Estados de feedback

- Los mensajes usan los tokens de la sección 1 con fondo suave (tonalidad al 8–10%) y texto del
  color base correspondiente.

## 6. Iconografía

- Se usa la librería **Material Symbols** (Google), variante _Rounded_.
- No se incrustan emojis en la interfaz ni en el código: cualquier icono se renderiza como glifo
  de Material Symbols.
- Ejemplos de uso en este proyecto: `undo` (deshacer), `smart_toy` (bot), `person` (humano),
  `restart_alt` (reiniciar), `emoji_events` (trofeo, fin de partida), `arrow_back` (volver).

## 7. Accesibilidad

- Contraste: los textos cumplen WCAG AA sobre su fondo.
- Foco visible: todos los elementos interactivos muestran `--focus-ring`.
- Área táctil mínima: 44×44px en controles táctiles.
- Los elementos interactivos usan etiquetas nativas (`button`, `a`, `label`) y `aria-label`
  descriptivos; las imágenes informativas llevan `alt` y las decorativas `alt=""`.

## 8. Implementación

Los tokens se definen como _custom properties_ en `src/styles/tokens.css` y se consumen en todo el
proyecto; no se repiten valores hex ni píxeles sueltos fuera de ese archivo. La nomenclatura de
clases CSS sigue **BEM** (`bloque__elemento--modificador`).
