// http://fpmrt.riken.jp/public_html/sakai/penrose.html

import { calcLegalVertices, calcLegalVerticesByName, LegalVertciesByName } from "./legalVertices";
import { sinDeg, cosDeg, twodec, cos72, sin72, goldenRatio } from "./Math";

const { hypot } = Math;
const POSITIONS_PER_LAP = 360 / 18;

export enum TileType {
  Kite = "Kite",
  Dart = "Dart",
}

export enum VertexType {
  Tail = "Tail",
  Head = "Head",
  Open = "Open",
  Mixed = "Mixed",
}

interface CoordinateAndAngle {
  coordinate: Point;
  angle: number;
}

export class VertexTile {
  constructor(position: number, type: TileType, corner: number, tile: Tile = null) {
    this.type = type;
    this.corner = corner;
    this.position = position;
    this.width = vertexTileWidth(type, corner);
    this.tile = tile;
  }

  type: TileType;
  corner: number;
  position: number; // Angle position in 18-deg steps
  width: number; // Angle width in 18-deg steps
  tile: Tile;
}

export class Vertex {
  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
    this.tiles = [];
  }
  x: number;
  y: number;
  tiles: VertexTile[];
  static legalVerticesByName: LegalVertciesByName;

  calcId() {
    return coordinateToId({ x: this.x, y: this.y });
  }

  tileWidthSum() {
    return this.tiles.reduce((p, c) => p + c.width, 0);
  }

  calcType() {
    const types = this.tiles.map((d) => toVertexType(d.type, d.corner));
    if (types.length === 0) return VertexType.Open;
    if (types.every((d) => d === VertexType.Tail)) return VertexType.Tail;
    if (types.every((d) => d === VertexType.Head)) return VertexType.Head;
    return VertexType.Mixed;
  }

  gapBetween(tileIndex0: number, tileIndex1: number) {
    const t0 = this.tiles[tileIndex0];
    const t1 = this.tiles[tileIndex1];
    if (tileIndex0 === tileIndex1) return POSITIONS_PER_LAP - t0.width;
    if (t0.position <= t1.position) return t1.position - (t0.position + t0.width);
    return t1.position + POSITIONS_PER_LAP - (t0.position + t0.width);
  }

  isLegal() {
    if (this.tiles.length === 0) return true;
    if (this.calcType() === VertexType.Mixed) return false;
    if (this.tiles.some((d, i, a) => this.gapBetween(i, (i + 1) % a.length) < 0)) return false;
    const n = this.tilesCanonicalString();
    if (!Vertex.legalVerticesByName) {
      const legalVertices = calcLegalVertices();
      Vertex.legalVerticesByName = calcLegalVerticesByName(legalVertices);
    }
    const v = Vertex.legalVerticesByName[n];
    return Boolean(v);
  }

  tilesToString(startIndex: number) {
    let s = "";
    const n = this.tiles.length;
    if (n === 0) {
      return "E";
    }
    for (let i = 0; i < n; i++) {
      const t = this.tiles[(i + startIndex) % n];
      s += t.type.slice(0, 1) + t.corner;
      if (n > 1) {
        const w = this.gapBetween((i + startIndex) % n, (i + startIndex + 1) % n);
        if (w > 0) {
          s += `G${w}`;
        }
      }
    }
    return s;
  }

  tilesCanonicalString() {
    let aa = [];
    const n = this.tiles.length;
    for (let i = 0; i < n; i++) {
      const t = this.tiles[i];
      aa.push((t.type === TileType.Kite ? 0 : 4) + t.corner);
      if (n > 1) {
        const w = this.gapBetween(i, (i + 1) % n);
        if (w < 0) {
          throw new Error("Vertex contains overlapping tiles");
        }
        if (w > 0) {
          aa.push(8 + w);
        }
      }
    }
    // Find lowest start index
    const t = [];
    let mm = 0;
    let mv;
    let mi = 0;
    for (let i = 0; i < aa.length; i++) {
      let v = 0;
      const a = aa[i % aa.length];
      if (a <= 8) {
        for (let j = 0; j < aa.length; j++) {
          v += aa[(i + j) % aa.length];
          if (j !== aa.length - 1) v *= 26;
        }
        t.push(v);
        if (!mv || v < mv) {
          mv = v;
          mi = mm;
        }
        mm++;
      }
    }
    return this.tilesToString(mi);
  }

  possiblePositions(width: number) {
    const n = this.tiles.length;
    const res = [];
    if (n === 0) return [...Array(POSITIONS_PER_LAP)].map((_, i) => i);
    for (let i = 0; i < n; i++) {
      const g = this.gapBetween(i, (i + 1) % n);
      if (g >= width) {
        const t = this.tiles[i];
        const p0 = t.position + t.width;
        let p = p0;
        while (p + width - p0 <= g) {
          res.push(p % POSITIONS_PER_LAP);
          p += 2;
        }
      }
    }
    return res;
  }

  vertexTileCoordinateAndAngle(type: TileType, corner: number, position: number): CoordinateAndAngle {
    let v;
    if (type === TileType.Kite) {
      v = [0, 6, 8, 14][corner];
    } else {
      // TileType.Dart
      v = [0, 8, 6, 14][corner];
    }
    let angle = 18 * (position - v);
    while (angle > 180) {
      angle -= 360;
    }
    while (angle <= -180) {
      angle += 360;
    }
    const cs = tileCoordinates(type, 0, 0, angle);
    const c = cs[corner];
    return { coordinate: { x: this.x - c.x, y: this.y - c.y }, angle };
  }

  sortTiles() {
    this.tiles.sort((d1, d2) => d1.position - d2.position);
  }
}

export class Tile {
  constructor(x: number, y: number, type: TileType = TileType.Kite, angle: number) {
    this.x = x;
    this.y = y;
    this.angle = angle;
    this.type = type;
  }
  x: number;
  y: number;
  angle: number;
  type: TileType;

  static createFromVertex(x: number, y: number, type: TileType, corner: number, angle: number) {
    const cs = tileCoordinates(type, x, y, angle);
    const c = cs[corner];
    return new Tile(x - c.x, y - c.y, type, angle);
  }

  coordinates() {
    return tileCoordinates(this.type, this.x, this.y, this.angle);
  }

  vertexIds() {
    return this.coordinates().map(coordinateToId);
  }
}

export class Tiling {
  constructor(tiles: Tile[] = null) {
    this.vertices = {};
    this.tiles = tiles;
    if (this.tiles && this.tiles.length > 0) {
      this.build();
    }
  }
  vertices: { [id: string]: Vertex };
  tiles: Tile[];

  build() {
    this.vertices = {};
    for (let tile of this.tiles) {
      const cs = tile.coordinates();
      for (let i in cs) {
        const c = cs[i];
        const id = coordinateToId(c);
        let v = this.vertices[id];
        if (!v) {
          v = new Vertex(c.x, c.y);
          this.vertices[id] = v;
        }
        v.tiles.push(new VertexTile(vertexTilePosition(tile.type, Number(i), tile.angle), tile.type, Number(i), tile));
      }
    }
    const vs = Object.values(this.vertices);
    for (let i = 0; i < vs.length; i++) {
      const v = vs[i];
      v.sortTiles();
    }
  }

  closestVertex(x: number, y: number) {
    let mv = null;
    let md = 0;
    const vs = Object.values(this.vertices);
    for (let i = 0; i < vs.length; i++) {
      const v = vs[i];
      const d = hypot(x - v.x, y - v.y);
      if (mv === null || d < md) {
        mv = v;
        md = d;
      }
    }
    return mv;
  }

  isLegal() {
    return Object.values(this.vertices).every((d) => d.isLegal());
  }
}

export function toVertexType(type: TileType, corner: number) {
  return corner % 2 === (type === TileType.Kite ? 0 : 1) ? VertexType.Tail : VertexType.Head;
}

// function vertexTileLength(type: TileType, corner: number): number {
//   if (corner === 0 || corner === 3) return 1;
//   return goldenRatio - 1;
// }

export function vertexTileWidth(type: TileType, corner: number): number {
  if (type === TileType.Kite) return [4, 4, 8, 4][corner];

  // TileType.Dart
  return [4, 2, 12, 2][corner];
}

export function vertexTilePosition(type: TileType, corner: number, angle: number): number {
  let v;
  if (type === TileType.Kite) {
    v = [0, 6, 8, 14][corner];
  } else {
    // TileType.Dart
    v = [0, 8, 6, 14][corner];
  }
  return (40 + v + Math.round(angle / 18)) % POSITIONS_PER_LAP;
}

export interface Point {
  x: number;
  y: number;
}

export function coordinateToId(p: Point) {
  const tx = p.x;
  const ty = p.x * cos72 + p.y * sin72;
  return `${twodec(tx)},${twodec(ty)}`;
}

function tileCoordinates(type: TileType, x: number, y: number, angle: number) {
  const r = goldenRatio - 1;
  const polarCoordinates = [
    [1, 0],
    [r, type === TileType.Kite ? 108 : 144],
    [r, type === TileType.Kite ? 36 : -36],
  ];
  const res = [{ x, y }];
  for (let i = 0; i < polarCoordinates.length; i++) {
    angle += polarCoordinates[i][1];
    const s = polarCoordinates[i][0];
    x += s * cosDeg(angle);
    y += s * sinDeg(angle);
    res.push({ x, y });
  }
  return res;
}
