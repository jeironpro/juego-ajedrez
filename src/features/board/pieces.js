import * as THREE from 'three';
import { PIECE_TYPES } from '@/features/game/constants.js';

// Altura total de cada pieza en unidades del tablero (la casilla mide 1)
export const PIECE_HEIGHTS = {
  [PIECE_TYPES.PAWN]: 0.78,
  [PIECE_TYPES.KNIGHT]: 1.0,
  [PIECE_TYPES.BISHOP]: 1.05,
  [PIECE_TYPES.ROOK]: 1.05,
  [PIECE_TYPES.QUEEN]: 1.3,
  [PIECE_TYPES.KING]: 1.42,
};

// Radio de la base común de todas las piezas
const BASE_RADIUS = 0.3;

// Perfiles de torneado (lathe): pares [radio, altura] que definen la silueta
const BODY_PROFILES = {
  [PIECE_TYPES.PAWN]: [
    [0.0, 0.0],
    [0.3, 0.0],
    [0.32, 0.02],
    [0.3, 0.06],
    [0.26, 0.1],
    [0.2, 0.2],
    [0.18, 0.28],
    [0.22, 0.32],
    [0.25, 0.36],
    [0.16, 0.42],
    [0.1, 0.46],
  ],
  [PIECE_TYPES.KNIGHT]: [
    [0.0, 0.0],
    [0.3, 0.0],
    [0.32, 0.02],
    [0.3, 0.06],
    [0.26, 0.1],
    [0.22, 0.18],
    [0.2, 0.26],
    [0.18, 0.32],
    [0.14, 0.4],
  ],
  [PIECE_TYPES.BISHOP]: [
    [0.0, 0.0],
    [0.3, 0.0],
    [0.32, 0.02],
    [0.28, 0.08],
    [0.24, 0.2],
    [0.18, 0.36],
    [0.12, 0.52],
    [0.08, 0.6],
  ],
  [PIECE_TYPES.ROOK]: [
    [0.0, 0.0],
    [0.3, 0.0],
    [0.32, 0.02],
    [0.28, 0.08],
    [0.26, 0.52],
    [0.3, 0.56],
    [0.32, 0.58],
    [0.28, 0.62],
  ],
  [PIECE_TYPES.QUEEN]: [
    [0.0, 0.0],
    [0.3, 0.0],
    [0.32, 0.02],
    [0.3, 0.08],
    [0.26, 0.3],
    [0.22, 0.52],
    [0.24, 0.6],
    [0.2, 0.68],
  ],
  [PIECE_TYPES.KING]: [
    [0.0, 0.0],
    [0.3, 0.0],
    [0.32, 0.02],
    [0.3, 0.08],
    [0.26, 0.3],
    [0.22, 0.72],
    [0.24, 0.8],
    [0.18, 0.86],
  ],
};

// Geometrías compartidas por tipo de pieza (se crean una sola vez)
const geometryCache = new Map();
// Materiales compartidos por color de pieza
const materialCache = new Map();

// Crea o recupera la geometría de torneado de un tipo de pieza
function getBodyGeometry(type) {
  if (!geometryCache.has(type)) {
    const points = BODY_PROFILES[type].map(([radius, height]) => new THREE.Vector2(radius, height));
    geometryCache.set(type, new THREE.LatheGeometry(points, 28));
  }
  return geometryCache.get(type);
}

// Silueta del caballo: perfil 2D extruido que se coloca sobre la base torneada
function createKnightHeadGeometry() {
  if (!geometryCache.has('knightHead')) {
    const shape = new THREE.Shape();
    shape.moveTo(-0.18, 0);
    shape.lineTo(0.18, 0);
    shape.lineTo(0.14, 0.14);
    // hocico
    shape.bezierCurveTo(0.24, 0.18, 0.28, 0.24, 0.24, 0.32);
    shape.lineTo(0.12, 0.32);
    // frente
    shape.bezierCurveTo(0.12, 0.44, 0.2, 0.52, 0.12, 0.64);
    // oreja
    shape.lineTo(0.04, 0.74);
    shape.lineTo(0.0, 0.64);
    // crin
    shape.bezierCurveTo(-0.1, 0.6, -0.16, 0.46, -0.18, 0.28);
    shape.closePath();
    geometryCache.set(
      'knightHead',
      new THREE.ExtrudeGeometry(shape, {
        depth: 0.16,
        bevelEnabled: true,
        bevelSize: 0.02,
        bevelThickness: 0.02,
      }),
    );
  }
  return geometryCache.get('knightHead');
}

// Material estándar por color: blanco hueso y negro, ambos mates
function getPieceMaterial(color) {
  if (!materialCache.has(color)) {
    const baseColor = color === 'white' ? 0xf5f4f2 : 0x2e2b28;
    materialCache.set(
      color,
      new THREE.MeshStandardMaterial({
        color: baseColor,
        roughness: 0.45,
        metalness: 0.05,
      }),
    );
  }
  return materialCache.get(color);
}

// Añade una pieza extruida o esférica como hijo del grupo
function addMesh(group, geometry, material, position, castShadow = true) {
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(position.x, position.y, position.z);
  mesh.castShadow = castShadow;
  group.add(mesh);
  return mesh;
}

// Crea la cruz de la corona del rey
function addKingCross(group, material, topY) {
  const crossHeight = 0.2;
  const crossWidth = 0.16;
  const crossThickness = 0.05;
  addMesh(group, new THREE.BoxGeometry(crossThickness, crossHeight, crossThickness), material, {
    x: 0,
    y: topY + crossHeight / 2,
    z: 0,
  });
  addMesh(group, new THREE.BoxGeometry(crossWidth, crossThickness, crossThickness), material, {
    x: 0,
    y: topY + crossHeight - crossThickness / 2,
    z: 0,
  });
}

// Almenas de la torre
function addRookBattlements(group, material, topY) {
  const battlements = 4;
  const step = (Math.PI * 2) / battlements;
  for (let i = 0; i < battlements; i += 1) {
    const angle = step * i;
    addMesh(group, new THREE.BoxGeometry(0.09, 0.09, 0.09), material, {
      x: Math.cos(angle) * 0.24,
      y: topY + 0.045,
      z: Math.sin(angle) * 0.24,
    });
  }
}

// Crea el grupo de mallas de una pieza de ajedrez
export function createPieceMesh(type, color) {
  const material = getPieceMaterial(color);
  const group = new THREE.Group();
  const height = PIECE_HEIGHTS[type];

  // La base de torre o el cuerpo torneado cubren la mayor parte de la altura
  addMesh(group, getBodyGeometry(type), material, { x: 0, y: 0.05, z: 0 });

  switch (type) {
    case PIECE_TYPES.PAWN:
      // cabeza esférica sobre el cuerpo
      addMesh(group, new THREE.SphereGeometry(0.16, 20, 16), material, {
        x: 0,
        y: 0.5,
        z: 0,
      });
      addMesh(group, new THREE.SphereGeometry(0.06, 12, 10), material, {
        x: 0,
        y: 0.68,
        z: 0,
      });
      break;

    case PIECE_TYPES.KNIGHT: {
      // cabeza de caballo extruida mirando hacia el bando contrario (+z)
      const head = createKnightHeadGeometry();
      const headMesh = new THREE.Mesh(head, material);
      headMesh.position.set(0, 0.3, 0);
      headMesh.rotation.x = -Math.PI / 2;
      headMesh.castShadow = true;
      group.add(headMesh);
      break;
    }

    case PIECE_TYPES.BISHOP:
      addMesh(group, new THREE.SphereGeometry(0.09, 12, 10), material, {
        x: 0,
        y: 0.7,
        z: 0,
      });
      break;

    case PIECE_TYPES.ROOK:
      addRookBattlements(group, material, 0.58);
      break;

    case PIECE_TYPES.QUEEN:
      // corona: cinco esferas pequeñas alrededor de la cúpula
      for (let i = 0; i < 5; i += 1) {
        const angle = (Math.PI * 2 * i) / 5;
        addMesh(group, new THREE.SphereGeometry(0.045, 10, 8), material, {
          x: Math.cos(angle) * 0.1,
          y: 0.78,
          z: Math.sin(angle) * 0.1,
        });
      }
      addMesh(group, new THREE.SphereGeometry(0.1, 12, 10), material, { x: 0, y: 0.84, z: 0 });
      break;

    case PIECE_TYPES.KING:
      addKingCross(group, material, height - 0.15);
      break;

    default:
      break;
  }

  // Escala global para que cada tipo ocupe exactamente su altura prevista
  const currentTop = computeGroupHeight(group);
  if (currentTop > 0) {
    const scale = height / currentTop;
    group.scale.set(scale, scale, scale);
  }
  return group;
}

// Altura aproximada del grupo recorriendo sus mallas
function computeGroupHeight(group) {
  let top = 0;
  group.traverse((object) => {
    if (object.isMesh) {
      const bounds = new THREE.Box3().setFromObject(object);
      top = Math.max(top, bounds.max.y);
    }
  });
  return top;
}

// Devuelve el número de mallas de un grupo (útil en tests)
export function countPieceMeshes(group) {
  let count = 0;
  group.traverse((object) => {
    if (object.isMesh) count += 1;
  });
  return count;
}
