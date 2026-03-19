export type TileType = 0|1|2|3|4|5|6|7|8|9
// 0=GRASS 1=TREE 2=WALL 3=PATH 4=WATER 5=TALL_GRASS 6=PORTAL 7=QUIZ_STATION 8=NPC_SPAWN 9=FLOWER

export interface NpcData {
  x: number; y: number; color: string; name: string
  lines: (string | { type: string; text?: string; monId?: number })[]
}
export interface Portal {
  x: number; y: number   // tile pos in THIS map
  to: string             // destination area name
  tx: number; ty: number // arrival tile in destination map
  label: string
  edge: 'top'|'bottom'|'left'|'right'  // which map edge this portal sits on
}
export interface AreaAtmosphere {
  skyTop: number; skyBottom: number
  fogColor: number; fogDensity: number
  sunColor: number; sunIntensity: number
  ambientColor: number; ambientIntensity: number
  groundColor: number
  grassColor: number; tallGrassColor: number
  pathColor: number; wallColor: number
  waterColor: number
  treeColor: number; treeTrunkColor: number
  particleColor?: number
  buildingColor?: number
  buildingRoofColor?: number
}
export interface Area {
  id: string; displayName: string
  map: TileType[][]
  cols: number; rows: number   // actual map dimensions
  monIds: number[]; desc: string
  playerStart: { x: number; y: number }
  portals: Portal[]; npcs: NpcData[]
  atmo: AreaAtmosphere
}

function makeMap(cols: number, rows: number): TileType[][] {
  return Array.from({length: rows}, () => Array(cols).fill(0) as TileType[])
}
function fill(m: TileType[][], r1: number, c1: number, r2: number, c2: number, t: TileType) {
  const rows = m.length, cols = m[0].length
  for (let r = r1; r <= r2; r++)
    for (let c = c1; c <= c2; c++)
      if (r>=0 && r<rows && c>=0 && c<cols) m[r][c] = t
}
function set(m: TileType[][], r: number, c: number, t: TileType) {
  if (r>=0 && r<m.length && c>=0 && c<m[0].length) m[r][c] = t
}

// ─────────────────────────────────────────────────────────────────────────────
// CPU VALLEY  24×18  — bright starter town with a lab building
// ─────────────────────────────────────────────────────────────────────────────
function buildCPUValley(): TileType[][] {
  const C=24, R=18, m = makeMap(C, R)
  // Tree border
  fill(m,0,0,0,C-1,1); fill(m,R-1,0,R-1,C-1,1)
  fill(m,0,0,R-1,0,1); fill(m,0,C-1,R-1,C-1,1)
  // Main paths: horizontal row 9, vertical col 11-12
  fill(m,9,1,9,C-2,3)
  fill(m,1,11,R-2,12,3)
  // Diagonal branch paths
  fill(m,4,1,4,10,3)
  fill(m,13,12,13,C-2,3)
  // Tall grass zones
  fill(m,1,1,8,9,5)
  fill(m,10,13,R-2,C-2,5)
  fill(m,1,14,6,C-2,5)
  // Water lake top-right corner
  fill(m,2,15,6,21,4)
  // Flowers
  set(m,3,10,9); set(m,5,12,9); set(m,11,10,9); set(m,14,14,9)
  // Lab building (bottom-left quadrant) — walls form rooms
  fill(m,11,2,16,9,2)          // outer walls
  fill(m,12,3,15,8,3)          // interior floor (path = lab floor)
  set(m,11,5,3); set(m,11,6,3) // north door
  set(m,16,5,3); set(m,16,6,3) // south door (faces path)
  set(m,13,2,3); set(m,14,2,3) // west door
  // Lab interior detail
  set(m,12,4,7); set(m,12,7,7) // quiz stations inside lab
  set(m,14,5,8); set(m,14,7,8) // NPCs inside lab
  // Town centre path plaza
  fill(m,7,9,11,14,3)
  set(m,9,9,7)  // central quiz station on plaza
  // NPCs on grass/path
  set(m,4,3,8); set(m,6,15,8); set(m,10,2,8)
  // Portals — on border cells, path leads right to them
  set(m,9,0,6)              // left  → Process Plains
  set(m,9,C-1,6)            // right → Network Nexus
  set(m,0,11,6); set(m,0,12,6)   // top   → Kernel Castle
  set(m,R-1,11,6); set(m,R-1,12,6) // bottom→ Memory Mountains
  return m
}

// ─────────────────────────────────────────────────────────────────────────────
// PROCESS PLAINS  28×18  — wide open, farmhouse, river
// ─────────────────────────────────────────────────────────────────────────────
function buildProcessPlains(): TileType[][] {
  const C=28, R=18, m = makeMap(C, R)
  fill(m,0,0,0,C-1,1); fill(m,R-1,0,R-1,C-1,1)
  fill(m,0,0,R-1,0,1); fill(m,0,C-1,R-1,C-1,1)
  // Main path horizontal + vertical
  fill(m,9,1,9,C-2,3)
  fill(m,1,13,R-2,14,3)
  // Branch paths
  fill(m,4,1,4,12,3)
  fill(m,13,15,13,C-2,3)
  // Tall grass — wide swaths
  fill(m,1,1,8,11,5)
  fill(m,10,15,R-2,C-2,5)
  fill(m,1,15,7,C-2,5)
  // River (water) running vertically right-side
  fill(m,1,20,R-2,22,4)
  fill(m,9,20,9,22,3)  // bridge over river
  // Farmhouse building — top area
  fill(m,2,15,7,20,2)   // outer walls
  fill(m,3,16,6,19,3)   // interior
  set(m,7,17,3); set(m,7,18,3)  // south door
  set(m,4,17,8); set(m,5,18,8) // NPCs inside
  set(m,3,17,7)  // quiz station inside farmhouse
  // Flowers
  set(m,3,13,9); set(m,8,3,9); set(m,11,16,9); set(m,14,8,9)
  // Ponds
  fill(m,11,2,15,6,4)
  fill(m,4,23,7,26,4)
  // NPCs
  set(m,4,4,8); set(m,12,8,8); set(m,14,22,8)
  // Portals
  set(m,9,0,6)               // left  → CPU Valley
  set(m,9,C-1,6)             // right → File Forest
  set(m,0,13,6); set(m,0,14,6)    // top   → Sync Sanctuary
  set(m,R-1,13,6); set(m,R-1,14,6) // bottom→ Memory Mountains
  return m
}

// ─────────────────────────────────────────────────────────────────────────────
// MEMORY MOUNTAINS  24×20  — rocky, research station, deep pools
// ─────────────────────────────────────────────────────────────────────────────
function buildMemoryMountains(): TileType[][] {
  const C=24, R=20, m = makeMap(C, R)
  // Stone wall border
  fill(m,0,0,0,C-1,2); fill(m,R-1,0,R-1,C-1,2)
  fill(m,0,0,R-1,0,2); fill(m,0,C-1,R-1,C-1,2)
  // Interior mountain walls (ridges)
  fill(m,4,2,4,10,2); fill(m,4,14,4,C-2,2)
  fill(m,10,2,10,9,2); fill(m,10,15,10,C-2,2)
  fill(m,15,4,15,12,2); fill(m,15,14,15,C-2,2)
  // Paths winding through passes
  fill(m,1,11,R-2,12,3)       // central spine
  fill(m,7,1,7,C-2,3)         // mid horizontal
  fill(m,13,1,13,C-2,3)       // lower horizontal
  fill(m,1,3,4,3,3)           // stub paths
  fill(m,1,20,4,20,3)
  fill(m,11,2,12,2,3)
  fill(m,11,C-2,12,C-2,3)
  // Pass gaps in ridges
  set(m,4,11,3); set(m,4,12,3)
  set(m,10,11,3); set(m,10,12,3)
  set(m,15,11,3); set(m,15,12,3)
  // Research station building (mid-right)
  fill(m,5,14,9,21,2)
  fill(m,6,15,8,20,3)
  set(m,9,16,3); set(m,9,17,3)  // south door
  set(m,7,16,7); set(m,7,19,7)  // quiz stations inside
  set(m,6,17,8); set(m,8,18,8)  // NPCs
  // Deep data pools
  fill(m,1,14,3,C-2,4)
  fill(m,11,1,14,5,4)
  fill(m,16,14,R-2,C-2,4)
  // Tall grass in sheltered areas
  fill(m,5,4,9,9,5)
  fill(m,14,6,R-2,10,5)
  // Crystal flowers
  set(m,6,11,9); set(m,11,13,9); set(m,16,11,9)
  // NPCs on paths
  set(m,7,4,8); set(m,13,14,8); set(m,18,13,8)
  // Portals
  set(m,7,0,6); set(m,13,0,6)         // left (two lanes)→ CPU Valley
  set(m,7,C-1,6); set(m,13,C-1,6)    // right → Sync Sanctuary
  set(m,0,11,6); set(m,0,12,6)        // top   → Process Plains
  set(m,R-1,11,6); set(m,R-1,12,6)   // bottom→ File Forest
  return m
}

// ─────────────────────────────────────────────────────────────────────────────
// FILE FOREST  26×22  — dense, winding paths, tree clusters, ranger cabin
// ─────────────────────────────────────────────────────────────────────────────
function buildFileForest(): TileType[][] {
  const C=26, R=22, m = makeMap(C, R)
  fill(m,0,0,0,C-1,1); fill(m,R-1,0,R-1,C-1,1)
  fill(m,0,0,R-1,0,1); fill(m,0,C-1,R-1,C-1,1)
  // Dense tree clusters interior
  fill(m,2,2,6,6,1); fill(m,2,10,5,13,1)
  fill(m,2,17,6,22,1); fill(m,2,24,6,24,1)
  fill(m,8,2,12,5,1); fill(m,8,10,12,13,1)
  fill(m,14,16,18,22,1); fill(m,15,2,20,6,1)
  // Winding forest paths
  fill(m,7,1,7,C-2,3)       // main horizontal
  fill(m,1,11,R-2,12,3)     // main vertical
  fill(m,4,7,4,10,3)        // NW branch
  fill(m,4,14,4,16,3)       // NE branch
  fill(m,11,6,11,10,3)      // mid-left branch
  fill(m,15,13,15,16,3)     // mid-right branch
  fill(m,18,7,18,11,3)      // south branch
  // Tall mossy grass
  fill(m,1,7,6,9,5)
  fill(m,8,14,13,16,5)
  fill(m,13,7,18,10,5)
  fill(m,1,14,5,C-2,5)
  // Forest pond
  fill(m,9,7,12,9,4)
  fill(m,16,17,20,22,4)
  // Ranger cabin (right-side clearing)
  fill(m,3,18,7,23,2)
  fill(m,4,19,6,22,3)
  set(m,7,20,3); set(m,7,21,3)  // south door
  set(m,5,20,7)                  // quiz station inside
  set(m,4,20,8); set(m,6,21,8)  // NPCs inside cabin
  // Flowers (glowing mushrooms visually)
  set(m,3,12,9); set(m,9,13,9); set(m,14,12,9); set(m,19,12,9)
  // NPCs on forest paths
  set(m,4,8,8); set(m,11,11,8); set(m,16,8,8)
  // Portals
  set(m,7,0,6)                   // left  → Process Plains
  set(m,7,C-1,6)                 // right → Network Nexus
  set(m,0,11,6); set(m,0,12,6)   // top   → Memory Mountains
  set(m,R-1,11,6); set(m,R-1,12,6) // bottom→ Sync Sanctuary
  return m
}

// ─────────────────────────────────────────────────────────────────────────────
// SYNC SANCTUARY  22×22  — symmetrical ritual ground, inner ring, 4 shrines
// ─────────────────────────────────────────────────────────────────────────────
function buildSyncSanctuary(): TileType[][] {
  const C=22, R=22, m = makeMap(C, R)
  // Outer crystal walls
  fill(m,0,0,0,C-1,2); fill(m,R-1,0,R-1,C-1,2)
  fill(m,0,0,R-1,0,2); fill(m,0,C-1,R-1,C-1,2)
  // Outer approach corridors (path to portals through walls)
  fill(m,1,10,4,11,3); fill(m,R-5,10,R-2,11,3)
  fill(m,10,1,11,4,3); fill(m,10,C-5,11,C-2,3)
  // Inner wall ring
  fill(m,4,4,4,C-5,2); fill(m,R-5,4,R-5,C-5,2)
  fill(m,4,4,R-5,4,2); fill(m,4,C-5,R-5,C-5,2)
  // Inner gate openings
  set(m,4,10,3); set(m,4,11,3)
  set(m,R-5,10,3); set(m,R-5,11,3)
  set(m,10,4,3); set(m,11,4,3)
  set(m,10,C-5,3); set(m,11,C-5,3)
  // Cross paths inside
  fill(m,5,10,R-6,11,3)
  fill(m,10,5,11,C-6,3)
  // Four shrine buildings (corners inside inner ring)
  fill(m,5,5,9,9,2);    fill(m,6,6,8,8,3)    // NW shrine
  fill(m,5,13,9,C-6,2); fill(m,6,14,8,C-7,3) // NE shrine
  fill(m,12,5,R-6,9,2); fill(m,13,6,R-7,8,3) // SW shrine
  fill(m,12,13,R-6,C-6,2);fill(m,13,14,R-7,C-7,3)// SE shrine
  // Shrine doors (face the cross paths)
  set(m,9,7,3); set(m,12,7,3)    // NW/SW south/north doors
  set(m,9,C-8,3); set(m,12,C-8,3)
  set(m,7,9,3); set(m,7,C-10,3)  // east doors
  set(m,14,9,3); set(m,14,C-10,3)
  // Shrine interiors: quiz stations + NPCs
  set(m,7,7,7); set(m,7,C-9,7)    // quiz stations
  set(m,14,7,7); set(m,14,C-9,7)
  set(m,6,7,8); set(m,8,C-9,8)    // NPCs in shrines
  set(m,13,7,8); set(m,15,C-9,8)
  // Centre altar (special)
  set(m,10,10,7); set(m,10,11,7); set(m,11,10,7); set(m,11,11,7)
  // Sacred pools (inside shrines)
  fill(m,6,6,7,7,4); fill(m,6,14,7,C-8,4)
  fill(m,13,6,14,7,4); fill(m,13,14,14,C-8,4)
  // Tall grass rings between walls
  fill(m,1,1,3,C-2,5); fill(m,R-4,1,R-2,C-2,5)
  fill(m,1,1,R-2,3,5); fill(m,1,C-4,R-2,C-2,5)
  // Flowers/crystals
  set(m,5,10,9); set(m,5,11,9); set(m,R-6,10,9); set(m,10,5,9); set(m,11,C-6,9)
  // NPC on central paths
  set(m,8,10,8); set(m,13,11,8); set(m,10,8,8)
  // Portals
  set(m,0,10,6); set(m,0,11,6)      // top   → File Forest
  set(m,R-1,10,6); set(m,R-1,11,6) // bottom→ File Forest (loop back)
  set(m,10,0,6); set(m,11,0,6)      // left  → Process Plains
  set(m,10,C-1,6); set(m,11,C-1,6) // right → Kernel Castle
  return m
}

// ─────────────────────────────────────────────────────────────────────────────
// NETWORK NEXUS  26×18  — cyberpunk grid, server buildings, data streams
// ─────────────────────────────────────────────────────────────────────────────
function buildNetworkNexus(): TileType[][] {
  const C=26, R=18, m = makeMap(C, R)
  fill(m,0,0,0,C-1,2); fill(m,R-1,0,R-1,C-1,2)
  fill(m,0,0,R-1,0,2); fill(m,0,C-1,R-1,C-1,2)
  // Grid roads (thick)
  fill(m,5,1,6,C-2,3)
  fill(m,11,1,12,C-2,3)
  fill(m,1,6,R-2,7,3)
  fill(m,1,13,R-2,14,3)
  fill(m,1,20,R-2,21,3)
  // Server buildings (rack clusters)
  fill(m,1,1,4,5,2);   fill(m,2,2,3,4,3)   // building A (NW)
  fill(m,1,9,4,12,2);  fill(m,2,10,3,11,3) // building B (N)
  fill(m,1,16,4,19,2); fill(m,2,17,3,18,3) // building C (NE)
  fill(m,7,1,10,5,2);  fill(m,8,2,9,4,3)   // building D (W)
  fill(m,7,9,10,12,2); fill(m,8,10,9,11,3) // building E (centre)
  fill(m,7,16,10,19,2);fill(m,8,17,9,18,3) // building F (E)
  fill(m,13,1,16,5,2); fill(m,14,2,15,4,3) // building G (SW)
  fill(m,13,9,16,12,2);fill(m,14,10,15,11,3) // building H (S)
  fill(m,13,16,16,19,2);fill(m,14,17,15,18,3)// building I (SE)
  // Building doors on grid roads
  set(m,4,3,3); set(m,6,3,3)
  set(m,4,10,3); set(m,6,10,3)
  set(m,4,17,3); set(m,6,17,3)
  set(m,10,3,3); set(m,12,3,3)
  set(m,10,10,3); set(m,12,10,3)
  set(m,10,17,3); set(m,12,17,3)
  set(m,16,3,3); set(m,16,10,3); set(m,16,17,3)
  // Data streams (water channels between buildings)
  fill(m,1,22,R-2,24,4)
  fill(m,1,8,4,8,4)
  fill(m,7,8,10,8,4)
  fill(m,13,8,16,8,4)
  // Quiz stations at road intersections
  set(m,5,7,7); set(m,5,14,7); set(m,11,7,7); set(m,11,21,7)
  // NPCs at intersections
  set(m,6,7,8); set(m,5,21,8); set(m,12,14,8)
  // Portals
  set(m,5,0,6); set(m,11,0,6)    // left  → CPU Valley (two lanes)
  set(m,5,C-1,6); set(m,11,C-1,6)// right → Kernel Castle
  set(m,0,6,6); set(m,0,7,6)      // top   → File Forest
  set(m,R-1,6,6); set(m,R-1,7,6) // bottom→ CPU Valley
  return m
}

// ─────────────────────────────────────────────────────────────────────────────
// KERNEL CASTLE  30×24  — fortress, keep, towers, throne room, moat
// ─────────────────────────────────────────────────────────────────────────────
function buildKernelCastle(): TileType[][] {
  const C=30, R=24, m = makeMap(C, R)
  // Outer stone border (thick double wall)
  fill(m,0,0,0,C-1,2); fill(m,R-1,0,R-1,C-1,2)
  fill(m,0,0,R-1,0,2); fill(m,0,C-1,R-1,C-1,2)
  fill(m,1,1,1,C-2,2); fill(m,R-2,1,R-2,C-2,2)
  fill(m,1,1,R-2,1,2); fill(m,1,C-2,R-2,C-2,2)
  // Moat (lava/water around inner keep)
  fill(m,4,4,4,C-5,4); fill(m,R-5,4,R-5,C-5,4)
  fill(m,4,4,R-5,4,4); fill(m,4,C-5,R-5,C-5,4)
  // Drawbridge paths (over moat)
  fill(m,4,13,4,16,3); fill(m,R-5,13,R-5,16,3)
  fill(m,11,4,12,4,3); fill(m,11,C-5,12,C-5,3)
  // Inner keep walls
  fill(m,5,5,5,C-6,2); fill(m,R-6,5,R-6,C-6,2)
  fill(m,5,5,R-6,5,2); fill(m,5,C-6,R-6,C-6,2)
  // Inner keep gates
  set(m,5,13,3); set(m,5,14,3); set(m,5,15,3)
  set(m,R-6,13,3); set(m,R-6,14,3); set(m,R-6,15,3)
  set(m,11,5,3); set(m,12,5,3)
  set(m,11,C-6,3); set(m,12,C-6,3)
  // Outer keep courtyards and paths
  fill(m,2,2,3,C-3,3)       // outer north corridor
  fill(m,R-4,2,R-3,C-3,3)   // outer south corridor
  fill(m,2,2,R-3,3,3)        // outer west corridor
  fill(m,2,C-4,R-3,C-3,3)   // outer east corridor
  // Corner towers (4 corners of outer wall)
  fill(m,2,2,3,3,2); fill(m,2,C-4,3,C-3,2)
  fill(m,R-4,2,R-3,3,2); fill(m,R-4,C-4,R-3,C-3,2)
  // Inner courtyard paths (cross pattern)
  fill(m,6,13,R-7,16,3)     // central N-S spine
  fill(m,11,6,12,C-7,3)     // central E-W corridor
  fill(m,6,6,6,12,3)        // NW corridor
  fill(m,6,17,6,C-7,3)      // NE corridor
  fill(m,R-7,6,R-7,12,3)    // SW corridor
  fill(m,R-7,17,R-7,C-7,3)  // SE corridor
  // Throne room (centre of inner keep)
  fill(m,9,12,14,17,2)       // throne room walls
  fill(m,10,13,13,16,3)      // throne room floor
  set(m,9,14,3); set(m,9,15,3) // throne room north door
  set(m,14,14,3); set(m,14,15,3) // south door
  set(m,11,12,3); set(m,12,12,3) // west door
  set(m,11,17,3); set(m,12,17,3) // east door
  // Boss arenas (boss tall grass in wings)
  fill(m,6,6,10,11,5)      // NW boss zone
  fill(m,6,18,10,C-7,5)    // NE boss zone
  fill(m,13,6,R-7,11,5)    // SW boss zone
  fill(m,13,18,R-7,C-7,5)  // SE boss zone
  // Lava pits inside boss zones
  fill(m,7,7,8,9,4); fill(m,7,19,8,21,4)
  fill(m,14,7,15,9,4); fill(m,14,19,15,21,4)
  // Quiz stations flanking throne
  set(m,11,9,7); set(m,12,C-10,7)
  // NPCs
  set(m,6,14,8); set(m,11,14,8); set(m,17,14,8)
  // Portals — through outer wall
  set(m,0,13,6); set(m,0,14,6); set(m,0,15,6) // top   → CPU Valley
  set(m,R-1,13,6); set(m,R-1,14,6); set(m,R-1,15,6) // bottom→ Network Nexus
  set(m,11,0,6); set(m,12,0,6)  // left  → Sync Sanctuary
  return m
}

// ─────────────────────────────────────────────────────────────────────────────
// AREA DEFINITIONS — portals are fully bidirectional
// ─────────────────────────────────────────────────────────────────────────────
export const AREAS: Record<string, Area> = {

  'CPU Valley': {
    id:'cpu_valley', displayName:'CPU Valley',
    map: buildCPUValley(), cols:24, rows:18,
    monIds:[1,2,6,13,15],
    desc:'Starter area. CPU scheduling algorithms are practised here. Processes compete for CPU time slices.',
    playerStart:{ x:11, y:9 },
    atmo:{
      skyTop:0x87ceeb, skyBottom:0xb8e4ff,
      fogColor:0xa0d4f0, fogDensity:0.010,
      sunColor:0xfff5dd, sunIntensity:1.4,
      ambientColor:0xc8e8ff, ambientIntensity:0.70,
      groundColor:0x3a6e28,
      grassColor:0x4a9a32, tallGrassColor:0x3a8222,
      pathColor:0xb09050, wallColor:0x6a7080,
      waterColor:0x3377cc, treeColor:0x3d8a22, treeTrunkColor:0x7a5230,
      buildingColor:0x7a8888, buildingRoofColor:0x556677,
    },
    portals:[
      {x:0,   y:9,  to:'Process Plains',   tx:26, ty:9,  label:'PROCESS PLAINS', edge:'left'},
      {x:23,  y:9,  to:'Network Nexus',    tx:1,  ty:5,  label:'NETWORK NEXUS',  edge:'right'},
      {x:11,  y:0,  to:'Kernel Castle',    tx:14, ty:22, label:'KERNEL CASTLE',  edge:'top'},
      {x:12,  y:0,  to:'Kernel Castle',    tx:15, ty:22, label:'KERNEL CASTLE',  edge:'top'},
      {x:11,  y:17, to:'Memory Mountains', tx:11, ty:1,  label:'MEMORY MTN',     edge:'bottom'},
      {x:12,  y:17, to:'Memory Mountains', tx:12, ty:1,  label:'MEMORY MTN',     edge:'bottom'},
    ],
    npcs:[
      {x:4,  y:4,  color:'#ff8800', name:'Prof. Dijkstra',
       lines:['Welcome to OS-Mon Academy! I am Prof. Dijkstra.',
              'OS concepts manifest as creatures called OS-Mons.',
              'Walk in TALL GRASS (the bright green patches) to encounter wild OS-Mons!',
              'Use Kernel Balls (FIGHT → BALL) to catch them.',
              'Press SPACE to open your menu — check your Roster, OS-Dex, and Items.',
              'Glowing black pillars are QUIZ STATIONS — press E near one for a quiz!',
              {type:'quiz', text:'Answer my question correctly and earn XP!'}]},
      {x:15, y:1,  color:'#4488ff', name:'Rival Torvalds',
       lines:["I already caught a Threadax AND a Contextus!",
              'CPU Valley is easy. The real challenge is Kernel Castle up north.',
              {type:'battle', monId:1, text:"Let's battle! My scheduling algorithm is unbeatable!"}]},
      {x:2,  y:10, color:'#88ff88', name:'Scholar Knuth',
       lines:['FCFS causes the Convoy Effect — a 10ms job stuck behind 1000ms!',
              'SJF is optimal for wait time but requires future knowledge.',
              "Linux's CFS scheduler uses a red-black tree ordered by vruntime."]},
    ],
  },

  'Process Plains': {
    id:'process_plains', displayName:'Process Plains',
    map: buildProcessPlains(), cols:28, rows:18,
    monIds:[1,2,13,15],
    desc:'Wide open plains where processes spawn freely and threads dart like lightning.',
    playerStart:{ x:25, y:9 },
    atmo:{
      skyTop:0x90d050, skyBottom:0xccf090,
      fogColor:0x98d060, fogDensity:0.008,
      sunColor:0xffffd0, sunIntensity:1.6,
      ambientColor:0xd8ffb0, ambientIntensity:0.65,
      groundColor:0x4a8a28,
      grassColor:0x5aaa38, tallGrassColor:0x48921e,
      pathColor:0xd8b860, wallColor:0x7a7a60,
      waterColor:0x4488ee, treeColor:0x44a828, treeTrunkColor:0x8a6038,
      buildingColor:0xc8a860, buildingRoofColor:0xa07840,
    },
    portals:[
      {x:0,  y:9,  to:'File Forest',      tx:24, ty:7,  label:'FILE FOREST',    edge:'left'},
      {x:27, y:9,  to:'CPU Valley',        tx:1,  ty:9,  label:'CPU VALLEY',     edge:'right'},
      {x:13, y:0,  to:'Sync Sanctuary',   tx:10, ty:20, label:'SYNC SANCTUARY',edge:'top'},
      {x:14, y:0,  to:'Sync Sanctuary',   tx:11, ty:20, label:'SYNC SANCTUARY',edge:'top'},
      {x:13, y:17, to:'Memory Mountains', tx:11, ty:1,  label:'MEMORY MTN',     edge:'bottom'},
      {x:14, y:17, to:'Memory Mountains', tx:12, ty:1,  label:'MEMORY MTN',     edge:'bottom'},
    ],
    npcs:[
      {x:4,  y:4,  color:'#3dcc70', name:'Threadsmith',
       lines:['fork() copies the parent process. exec() loads a new program.',
              'PCB: PID, state, registers, memory maps, open file table.',
              'States: NEW → READY → RUNNING → WAITING → TERMINATED.',
              'Zombie: terminated but parent has not called wait() yet!']},
      {x:8,  y:12, color:'#4488ff', name:'Trainer Fork',
       lines:['Threadax shares address space — much cheaper than Processus!',
              'But shared memory needs synchronisation. No sync = race conditions!',
              {type:'battle', monId:2, text:"My Threadax is trained! Let's battle!"}]},
      {x:22, y:14, color:'#ff8866', name:'Signal Sally',
       lines:['SIGTERM(15): politely exit. SIGKILL(9): forcibly kill — unstoppable!',
              'SIGCHLD: sent to parent on child termination. Call wait() to avoid zombies!',
              'Pipes: unidirectional byte stream. fork()+pipe() = classic Unix IPC.']},
    ],
  },

  'Memory Mountains': {
    id:'memory_mountains', displayName:'Memory Mountains',
    map: buildMemoryMountains(), cols:24, rows:20,
    monIds:[3,5,11],
    desc:'Virtual memory, paging, and cache concepts reign here. Page faults echo between rocky cliffs.',
    playerStart:{ x:11, y:7 },
    atmo:{
      skyTop:0x3355aa, skyBottom:0x6688cc,
      fogColor:0x5577bb, fogDensity:0.020,
      sunColor:0xdde8ff, sunIntensity:0.95,
      ambientColor:0x7788bb, ambientIntensity:0.95,
      groundColor:0x22304a,
      grassColor:0x263650, tallGrassColor:0x1a2840,
      pathColor:0x707890, wallColor:0x3a4870,
      waterColor:0x1a3488, treeColor:0x243260, treeTrunkColor:0x404860,
      buildingColor:0x445588, buildingRoofColor:0x334466,
      particleColor:0x8888ff,
    },
    portals:[
      {x:0,  y:7,  to:'CPU Valley',       tx:11, ty:1,  label:'CPU VALLEY',     edge:'left'},
      {x:0,  y:13, to:'CPU Valley',        tx:11, ty:1,  label:'CPU VALLEY',     edge:'left'},
      {x:23, y:7,  to:'Sync Sanctuary',   tx:1,  ty:10, label:'SYNC SANCTUARY', edge:'right'},
      {x:23, y:13, to:'Sync Sanctuary',   tx:1,  ty:11, label:'SYNC SANCTUARY', edge:'right'},
      {x:11, y:0,  to:'Process Plains',   tx:13, ty:16, label:'PROCESS PLAINS', edge:'top'},
      {x:12, y:0,  to:'Process Plains',   tx:14, ty:16, label:'PROCESS PLAINS', edge:'top'},
      {x:11, y:19, to:'File Forest',      tx:11, ty:1,  label:'FILE FOREST',    edge:'bottom'},
      {x:12, y:19, to:'File Forest',      tx:12, ty:1,  label:'FILE FOREST',    edge:'bottom'},
    ],
    npcs:[
      {x:4,  y:7,  color:'#9944ee', name:'Prof. Denning',
       lines:['Virtual memory: each process sees 2^64 bytes — but RAM is finite!',
              'OS PAGE TABLE maps virtual pages (4KB) to physical frames.',
              'PAGE FAULT: page not in RAM, OS fetches from disk (~10ms vs 100ns for RAM)!',
              {type:'quiz', text:'Quiz: What is the TLB and why does it exist?'}]},
      {x:13, y:13, color:'#e0c030', name:'Cacher Kim',
       lines:['L1: ~32KB 4-cycle. L2: ~256KB 12-cycle. L3: ~8MB 40-cycle.',
              'Cache exploits spatial and temporal locality.',
              'A 64-byte cache line loads on each miss — arrays ALWAYS beat linked lists!']},
      {x:13, y:18, color:'#44cc88', name:'Swap Guru',
       lines:['Thrashing: ALL working sets exceed physical RAM.',
              'Every process page-faults constantly. CPU utilisation collapses!',
              "Denning's Working Set: if ΣW(t,Δ) > RAM, suspend some processes."]},
    ],
  },

  'File Forest': {
    id:'file_forest', displayName:'File Forest',
    map: buildFileForest(), cols:26, rows:22,
    monIds:[7,12,14],
    desc:'Deep directory trees form a dense forest. Every file has an inode hanging like a leaf from a branch.',
    playerStart:{ x:11, y:7 },
    atmo:{
      skyTop:0x083318, skyBottom:0x0f4020,
      fogColor:0x0a3015, fogDensity:0.025,
      sunColor:0x99ee77, sunIntensity:0.75,
      ambientColor:0x40aa40, ambientIntensity:0.85,
      groundColor:0x081f06,
      grassColor:0x174a0e, tallGrassColor:0x0e3308,
      pathColor:0x5a4218, wallColor:0x2a3818,
      waterColor:0x183820, treeColor:0x165810, treeTrunkColor:0x3a2008,
      particleColor:0x88ff44,
      buildingColor:0x3a5520, buildingRoofColor:0x284010,
    },
    portals:[
      {x:0,  y:7,  to:'Process Plains',   tx:1,  ty:9,  label:'PROCESS PLAINS', edge:'left'},
      {x:25, y:7,  to:'Network Nexus',    tx:1,  ty:11, label:'NETWORK NEXUS',  edge:'right'},
      {x:11, y:0,  to:'Memory Mountains', tx:11, ty:18, label:'MEMORY MTN',     edge:'top'},
      {x:12, y:0,  to:'Memory Mountains', tx:12, ty:18, label:'MEMORY MTN',     edge:'top'},
      {x:11, y:21, to:'Sync Sanctuary',   tx:10, ty:1,  label:'SYNC SANCTUARY', edge:'bottom'},
      {x:12, y:21, to:'Sync Sanctuary',   tx:11, ty:1,  label:'SYNC SANCTUARY', edge:'bottom'},
    ],
    npcs:[
      {x:8,  y:4,  color:'#66aa33', name:'Arborist ext4',
       lines:['Every tree is a directory. Every leaf is an inode!',
              'Filesystem: directory entries (names) + inodes (metadata) + data blocks.',
              'Journal: write to journal FIRST, then disk. Enables crash recovery!',
              {type:'quiz', text:'Test your inode knowledge!'}]},
      {x:11, y:11, color:'#44cc77', name:'Linker Linus',
       lines:['Hard link: another dir entry pointing to the SAME inode. refcount++.',
              'Soft link: a FILE whose content is a PATH STRING to the target.',
              'Delete hard link target? Inode survives until refcount hits 0.',
              'Symlink to deleted target? DANGLING link — broken!']},
      {x:16, y:8,  color:'#ff8833', name:'Buffer Barry',
       lines:['Kernel page cache buffers ALL file I/O transparently.',
              'write() → page cache (dirty pages) → flushed by kernel daemon.',
              'O_DIRECT: bypasses page cache — used by databases!']},
    ],
  },

  'Sync Sanctuary': {
    id:'sync_sanctuary', displayName:'Sync Sanctuary',
    map: buildSyncSanctuary(), cols:22, rows:22,
    monIds:[4,9,17,18],
    desc:'A sacred place where synchronisation is enforced. Race conditions are absolutely forbidden here.',
    playerStart:{ x:10, y:10 },
    atmo:{
      skyTop:0x1a0038, skyBottom:0x380070,
      fogColor:0x200048, fogDensity:0.022,
      sunColor:0xcc44ff, sunIntensity:0.85,
      ambientColor:0x7733bb, ambientIntensity:1.05,
      groundColor:0x150028,
      grassColor:0x220838, tallGrassColor:0x160226,
      pathColor:0x5522aa, wallColor:0x442288,
      waterColor:0x330088, treeColor:0x2a0888, treeTrunkColor:0x220660,
      particleColor:0xaa44ff,
      buildingColor:0x442288, buildingRoofColor:0x331166,
    },
    portals:[
      {x:10, y:0,  to:'File Forest',      tx:11, ty:20, label:'FILE FOREST',    edge:'top'},
      {x:11, y:0,  to:'File Forest',      tx:12, ty:20, label:'FILE FOREST',    edge:'top'},
      {x:10, y:21, to:'File Forest',      tx:11, ty:20, label:'FILE FOREST',    edge:'bottom'},
      {x:11, y:21, to:'File Forest',      tx:12, ty:20, label:'FILE FOREST',    edge:'bottom'},
      {x:0,  y:10, to:'Memory Mountains', tx:22, ty:7,  label:'MEMORY MTN',     edge:'left'},
      {x:0,  y:11, to:'Memory Mountains', tx:22, ty:13, label:'MEMORY MTN',     edge:'left'},
      {x:21, y:10, to:'Kernel Castle',    tx:1,  ty:11, label:'KERNEL CASTLE',  edge:'right'},
      {x:21, y:11, to:'Kernel Castle',    tx:1,  ty:12, label:'KERNEL CASTLE',  edge:'right'},
    ],
    npcs:[
      {x:10, y:8,  color:'#ee44bb', name:'Dijkstra II',
       lines:['Race condition: two threads access shared data, result depends on timing.',
              'Fix: critical section protected by mutex. ONE thread at a time.',
              "Dijkstra's semaphore (1965): P() decrement/wait, V() increment/signal.",
              {type:'quiz', text:'Test your synchronisation knowledge!'}]},
      {x:11, y:13, color:'#ff4444', name:'Deadlock Dan',
       lines:['Deadlock requires ALL FOUR Coffman conditions simultaneously!',
              'Break any one: no mutual exclusion, no hold-and-wait, allow preemption, or no circular wait.',
              {type:'battle', monId:4, text:'Face my DeadLockus if you dare!'}]},
      {x:8,  y:10, color:'#22ddbb', name:'Monitor Maria',
       lines:['Monitor: mutex + condition variables + shared data.',
              "Java's synchronized turns any object into a monitor.",
              'ALWAYS use while() not if() — Mesa semantics re-check condition!']},
    ],
  },

  'Network Nexus': {
    id:'network_nexus', displayName:'Network Nexus',
    map: buildNetworkNexus(), cols:26, rows:18,
    monIds:[10],
    desc:'Packets fly at light speed between server racks. TCP streams and UDP bursts fill the air.',
    playerStart:{ x:1, y:5 },
    atmo:{
      skyTop:0x000d1a, skyBottom:0x001428,
      fogColor:0x000e1e, fogDensity:0.018,
      sunColor:0x2288ff, sunIntensity:1.1,
      ambientColor:0x0033aa, ambientIntensity:1.0,
      groundColor:0x000810,
      grassColor:0x001020, tallGrassColor:0x000810,
      pathColor:0x1a3888, wallColor:0x0e1e3a,
      waterColor:0x0022bb, treeColor:0x002244, treeTrunkColor:0x0a1828,
      particleColor:0x00aaff,
      buildingColor:0x0e1e3a, buildingRoofColor:0x0a1428,
    },
    portals:[
      {x:0,  y:5,  to:'CPU Valley',       tx:22, ty:9,  label:'CPU VALLEY',     edge:'left'},
      {x:0,  y:11, to:'CPU Valley',        tx:22, ty:9,  label:'CPU VALLEY',     edge:'left'},
      {x:25, y:5,  to:'Kernel Castle',    tx:1,  ty:11, label:'KERNEL CASTLE',  edge:'right'},
      {x:25, y:11, to:'Kernel Castle',    tx:1,  ty:12, label:'KERNEL CASTLE',  edge:'right'},
      {x:6,  y:0,  to:'File Forest',      tx:24, ty:7,  label:'FILE FOREST',    edge:'top'},
      {x:7,  y:0,  to:'File Forest',      tx:25, ty:7,  label:'FILE FOREST',    edge:'top'},
      {x:6,  y:17, to:'CPU Valley',        tx:11, ty:16, label:'CPU VALLEY',     edge:'bottom'},
      {x:7,  y:17, to:'CPU Valley',        tx:12, ty:16, label:'CPU VALLEY',     edge:'bottom'},
    ],
    npcs:[
      {x:7,  y:6,  color:'#2288ee', name:'TCP Thompson',
       lines:['TCP: RELIABLE, ORDERED, BYTE-STREAM delivery over IP.',
              '3-way handshake: SYN → SYN/ACK → ACK. Then data flows both ways.',
              'Sliding window + ACKs. Timeout + retransmit if no ACK received.',
              {type:'quiz', text:'Quiz me about networking!'}]},
      {x:21, y:5,  color:'#44aaff', name:'Router Rita',
       lines:['Each router: destination prefix → next hop.',
              'OSPF: link-state, knows full topology, runs Dijkstra!',
              'BGP: path-vector between ISPs. Policies over raw speed.']},
      {x:14, y:12, color:'#88eeff', name:'Socket Sam',
       lines:['server: socket()→bind()→listen()→accept()',
              'client: socket()→connect()→send()/recv()',
              'epoll + non-blocking I/O: ONE thread handles THOUSANDS of connections!']},
    ],
  },

  'Kernel Castle': {
    id:'kernel_castle', displayName:'Kernel Castle',
    map: buildKernelCastle(), cols:30, rows:24,
    monIds:[6,8,16],
    desc:'The most powerful area. Ancient stone walls hold the secrets of the OS core.',
    playerStart:{ x:14, y:22 },
    atmo:{
      skyTop:0x120600, skyBottom:0x280e00,
      fogColor:0x1e0800, fogDensity:0.016,
      sunColor:0xff5500, sunIntensity:1.2,
      ambientColor:0x551800, ambientIntensity:0.9,
      groundColor:0x0e0400,
      grassColor:0x160600, tallGrassColor:0x0e0400,
      pathColor:0x503828, wallColor:0x402c18,
      waterColor:0xcc2200, treeColor:0x2e1000, treeTrunkColor:0x200a00,
      particleColor:0xff4400,
      buildingColor:0x3a2010, buildingRoofColor:0x2a1608,
    },
    portals:[
      {x:13, y:0,  to:'CPU Valley',       tx:11, ty:1,  label:'CPU VALLEY',     edge:'top'},
      {x:14, y:0,  to:'CPU Valley',        tx:12, ty:1,  label:'CPU VALLEY',     edge:'top'},
      {x:15, y:0,  to:'CPU Valley',        tx:13, ty:1,  label:'CPU VALLEY',     edge:'top'},
      {x:13, y:23, to:'Network Nexus',    tx:24, ty:5,  label:'NETWORK NEXUS',  edge:'bottom'},
      {x:14, y:23, to:'Network Nexus',    tx:25, ty:5,  label:'NETWORK NEXUS',  edge:'bottom'},
      {x:15, y:23, to:'Network Nexus',    tx:25, ty:11, label:'NETWORK NEXUS',  edge:'bottom'},
      {x:0,  y:11, to:'Sync Sanctuary',   tx:20, ty:10, label:'SYNC SANCTUARY', edge:'left'},
      {x:0,  y:12, to:'Sync Sanctuary',   tx:20, ty:11, label:'SYNC SANCTUARY', edge:'left'},
    ],
    npcs:[
      {x:14, y:6,  color:'#ff7700', name:'Linus T.',
       lines:['You made it to Kernel Castle.',
              'SYSCALL crosses USER/KERNEL boundary. Ring 0 = full hardware access.',
              'Linux has ~400 syscalls: open, read, write, fork, mmap, ioctl...',
              {type:'battle', monId:8, text:'Face the mighty Kernelion!'}]},
      {x:14, y:11, color:'#eecc00', name:'IRQ Inspector',
       lines:['Hardware signals CPU via Interrupt ReQuest (IRQ) lines.',
              'CPU suspends execution, saves state, vectors to ISR.',
              'Top half: minimal fast ISR. Bottom half: deferred tasklet/workqueue.',
              {type:'quiz', text:'Prove your kernel knowledge!'}]},
      {x:14, y:17, color:'#cc88ff', name:'Ring Watcher',
       lines:['Ring 0 (kernel) → Ring 3 (user). Rings 1-2 largely unused.',
              'Syscall: SYSCALL instruction → Ring 0 → kernel executes → SYSRET.',
              'Context switch saves: RIP, RSP, RFLAGS, all GPRs, CR3 (page table base).',
              'Monolithic (Linux): all services in kernel space.',
              'Microkernel (QNX): minimal kernel, user-space services.']},
    ],
  },
}

// Patch Process Plains portals — Sync Sanctuary is 22 rows so bottom row = 21
;(AREAS['Process Plains'].portals as Portal[]).forEach(p => {
  if (p.label === 'SYNC SANCTUARY') p.ty = 21
})

export const AREA_ORDER = [
  'CPU Valley','Process Plains','Memory Mountains',
  'File Forest','Sync Sanctuary','Network Nexus','Kernel Castle',
]
