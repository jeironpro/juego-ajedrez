import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { createPieceMesh } from './pieces.js';

// Tamaño del tablero en casillas y del lado de cada casilla en unidades de mundo
export const BOARD_SIZE = 8;
export const SQUARE_SIZE = 1;

// Colores por defecto (coinciden con los tokens de diseño); la UI los sobreescribe
export const DEFAULT_COLORS = {
  boardLight: 0xefeae4,
  boardDark: 0xb9ac98,
  frame: 0xffffff,
  selection: 0x5c98f9,
  target: 0x73b468,
  capture: 0xdc2626,
  lastMove: 0xfbcd44,
  check: 0xdc2626,
};

// Convierte coordenadas de la matriz (row, col) a posición mundial en el plano XZ
function toWorldPosition(row, col) {
  return new THREE.Vector3(col - (BOARD_SIZE - 1) / 2, 0, row - (BOARD_SIZE - 1) / 2);
}

// Crea el grupo de casillas con su marco y las mallas de resaltado reutilizables.
// Se expone separado del renderer para poder testearlo sin contexto WebGL.
export function createBoardGroup(colors) {
  const merged = { ...DEFAULT_COLORS, ...colors };
  const group = new THREE.Group();

  // Base y marco del tablero
  const frameMaterial = new THREE.MeshStandardMaterial({ color: merged.frame, roughness: 0.6 });
  const slab = new THREE.Mesh(new THREE.BoxGeometry(8.7, 0.24, 8.7), frameMaterial);
  slab.position.y = -0.12;
  slab.receiveShadow = true;
  group.add(slab);

  // Casillas: planos ligeramente elevados sobre la base
  const squareMeshes = [];
  const lightMaterial = new THREE.MeshStandardMaterial({
    color: merged.boardLight,
    roughness: 0.75,
  });
  const darkMaterial = new THREE.MeshStandardMaterial({ color: merged.boardDark, roughness: 0.75 });
  const squareGeometry = new THREE.BoxGeometry(SQUARE_SIZE - 0.02, 0.06, SQUARE_SIZE - 0.02);

  for (let row = 0; row < BOARD_SIZE; row += 1) {
    for (let col = 0; col < BOARD_SIZE; col += 1) {
      const material = (row + col) % 2 === 0 ? lightMaterial : darkMaterial;
      const mesh = new THREE.Mesh(squareGeometry, material);
      const position = toWorldPosition(row, col);
      mesh.position.set(position.x, 0.02, position.z);
      mesh.receiveShadow = true;
      group.add(mesh);
      squareMeshes.push({ mesh, row, col });
    }
  }

  // Contenedor de piezas (se rellena al sincronizar el tablero)
  const piecesGroup = new THREE.Group();
  group.add(piecesGroup);

  // Mallas de resaltado reutilizables (se reposicionan en cada actualización)
  const highlights = createHighlightMeshes(merged);
  highlights.list.forEach((highlight) => group.add(highlight.mesh));

  return {
    group,
    piecesGroup,
    squareMeshes,
    highlights,
  };
}

// Crea las mallas de resaltado: selección, destinos, última jugada y jaque
function createHighlightMeshes(colors) {
  const meshes = [];
  const squareSize = SQUARE_SIZE - 0.02;

  // Marco de la pieza seleccionada
  const selection = new THREE.Mesh(
    new THREE.BoxGeometry(squareSize, 0.02, squareSize),
    new THREE.MeshBasicMaterial({
      color: colors.selection,
      transparent: true,
      opacity: 0.45,
      depthWrite: false,
    }),
  );
  selection.visible = false;
  meshes.push({ key: 'selection', mesh: selection });

  // Destinos legales: un punto por casilla vacía y un anillo por captura
  const targetPool = [];
  for (let i = 0; i < 24; i += 1) {
    const dot = new THREE.Mesh(
      new THREE.CylinderGeometry(0.13, 0.13, 0.02, 20),
      new THREE.MeshBasicMaterial({
        color: colors.target,
        transparent: true,
        opacity: 0.55,
        depthWrite: false,
      }),
    );
    dot.visible = false;
    meshes.push({ key: 'target', mesh: dot });
    targetPool.push(dot);
  }
  const capturePool = [];
  for (let i = 0; i < 8; i += 1) {
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(0.26, 0.07, 10, 24),
      new THREE.MeshBasicMaterial({
        color: colors.capture,
        transparent: true,
        opacity: 0.65,
        depthWrite: false,
      }),
    );
    ring.visible = false;
    meshes.push({ key: 'capture', mesh: ring });
    capturePool.push(ring);
  }

  // Resalte de la última jugada (hasta dos casillas)
  const lastMovePool = [];
  for (let i = 0; i < 2; i += 1) {
    const tint = new THREE.Mesh(
      new THREE.BoxGeometry(squareSize, 0.02, squareSize),
      new THREE.MeshBasicMaterial({
        color: colors.lastMove,
        transparent: true,
        opacity: 0.28,
        depthWrite: false,
      }),
    );
    tint.visible = false;
    meshes.push({ key: 'lastMove', mesh: tint });
    lastMovePool.push(tint);
  }

  // Resalte de la casilla del rey en jaque
  const check = new THREE.Mesh(
    new THREE.BoxGeometry(squareSize, 0.02, squareSize),
    new THREE.MeshBasicMaterial({
      color: colors.check,
      transparent: true,
      opacity: 0.4,
      depthWrite: false,
    }),
  );
  check.visible = false;
  meshes.push({ key: 'check', mesh: check });

  return { selection, targetPool, capturePool, lastMovePool, check, list: meshes };
}

// Sincroniza las piezas del tablero con la escena
export function syncPieces(piecesGroup, board) {
  // Se eliminan las mallas previas (las geometrías y materiales se comparten en caché)
  while (piecesGroup.children.length > 0) {
    piecesGroup.remove(piecesGroup.children[0]);
  }
  for (let row = 0; row < BOARD_SIZE; row += 1) {
    for (let col = 0; col < BOARD_SIZE; col += 1) {
      const piece = board[row][col];
      if (piece === null) continue;
      const mesh = createPieceMesh(piece.type, piece.color);
      const position = toWorldPosition(row, col);
      mesh.position.set(position.x, 0.06, position.z);
      piecesGroup.add(mesh);
    }
  }
}

// Actualiza las mallas de resaltado según el estado de interacción
export function updateHighlights(highlights, state) {
  const { selection, targetPool, capturePool, lastMovePool, check } = highlights;
  const { selected, targets, lastMove, checkSquare } = state;

  // Pieza seleccionada
  selection.visible = selected !== null;
  if (selected !== null) {
    const position = toWorldPosition(selected.row, selected.col);
    selection.position.set(position.x, 0.05, position.z);
  }

  // Destinos legales (punto o anillo según sea captura)
  const dots = targets?.filter((target) => !target.isCapture) ?? [];
  const rings = targets?.filter((target) => target.isCapture) ?? [];
  dots.forEach((target, index) => {
    if (index >= targetPool.length) return;
    const position = toWorldPosition(target.row, target.col);
    targetPool[index].visible = true;
    targetPool[index].position.set(position.x, 0.05, position.z);
  });
  targetPool.forEach((dot, index) => {
    if (index >= dots.length) dot.visible = false;
  });
  rings.forEach((target, index) => {
    if (index >= capturePool.length) return;
    const position = toWorldPosition(target.row, target.col);
    capturePool[index].visible = true;
    capturePool[index].position.set(position.x, 0.05, position.z);
  });
  capturePool.forEach((ring, index) => {
    if (index >= rings.length) ring.visible = false;
  });

  // Última jugada
  lastMovePool.forEach((tint, index) => {
    const square = index === 0 ? lastMove?.from : lastMove?.to;
    tint.visible = square !== undefined && square !== null;
    if (square !== undefined && square !== null) {
      const position = toWorldPosition(square.row, square.col);
      tint.position.set(position.x, 0.04, position.z);
    }
  });

  // Rey en jaque
  check.visible = checkSquare !== null;
  if (checkSquare !== null) {
    const position = toWorldPosition(checkSquare.row, checkSquare.col);
    check.position.set(position.x, 0.045, position.z);
  }
}

// Configura la luz y la cámara de la escena
function addLighting(scene) {
  const ambient = new THREE.AmbientLight(0xffffff, 0.55);
  scene.add(ambient);

  const hemisphere = new THREE.HemisphereLight(0xffffff, 0xb9ac98, 0.35);
  scene.add(hemisphere);

  const sun = new THREE.DirectionalLight(0xffffff, 1.4);
  sun.position.set(6, 12, 8);
  sun.castShadow = true;
  sun.shadow.mapSize.set(1024, 1024);
  sun.shadow.camera.left = -8;
  sun.shadow.camera.right = 8;
  sun.shadow.camera.top = 8;
  sun.shadow.camera.bottom = -8;
  sun.shadow.camera.near = 1;
  sun.shadow.camera.far = 30;
  scene.add(sun);
}

// Crea la escena completa con renderer WebGL, cámara orbital y picking por raycast
export function createBoardScene(canvas, { colors = {}, onSquareClick = () => {} } = {}) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const scene = new THREE.Scene();
  addLighting(scene);

  const boardGroup = createBoardGroup(colors);
  scene.add(boardGroup.group);

  const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
  camera.position.set(7.2, 8.6, 9.4);
  camera.lookAt(0, 0, 0);

  const controls = new OrbitControls(camera, canvas);
  controls.target.set(0, 0, 0);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.enablePan = false;
  controls.minDistance = 9;
  controls.maxDistance = 26;
  controls.maxPolarAngle = Math.PI / 2.2;

  let rafId = null;
  const animate = () => {
    rafId = requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
  };
  animate();

  // Selección por clic: se proyecta un rayo contra las casillas
  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  const handlePointerDown = (event) => {
    const rect = canvas.getBoundingClientRect();
    pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(pointer, camera);
    const squareMeshes = boardGroup.squareMeshes.map((entry) => entry.mesh);
    const hits = raycaster.intersectObjects(squareMeshes, false);
    if (hits.length === 0) return;
    const { mesh } = hits[0];
    const entry = boardGroup.squareMeshes.find((candidate) => candidate.mesh === mesh);
    if (entry !== undefined) onSquareClick(entry.row, entry.col);
  };

  // Cursor de puntero sobre las casillas
  const handlePointerMove = (event) => {
    const rect = canvas.getBoundingClientRect();
    pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(pointer, camera);
    const squareMeshes = boardGroup.squareMeshes.map((entry) => entry.mesh);
    const hits = raycaster.intersectObjects(squareMeshes, false);
    canvas.style.cursor = hits.length > 0 ? 'pointer' : 'grab';
  };

  canvas.addEventListener('pointerdown', handlePointerDown);
  canvas.addEventListener('pointermove', handlePointerMove);

  return {
    setBoard(board) {
      syncPieces(boardGroup.piecesGroup, board);
    },
    setState(state) {
      updateHighlights(boardGroup.highlights, state);
    },
    resize(width, height) {
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    },
    dispose() {
      cancelAnimationFrame(rafId);
      controls.dispose();
      canvas.removeEventListener('pointerdown', handlePointerDown);
      canvas.removeEventListener('pointermove', handlePointerMove);
      renderer.dispose();
    },
  };
}
