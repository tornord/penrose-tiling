import { calcBasicShapes } from "./basicShapes";
import { Vertex, Tiling, Tile, TileType, VertexType } from "./Vertex";

export class LegalVertex {
  constructor(name: string, type: VertexType, numberOfTiles: number) {
    this.name = name;
    this.type = type;
    this.possibleShapes = [];
    this.possibleTiles = [];
    this.numberOfTiles = numberOfTiles;
  }
  name: string;
  type: VertexType;
  possibleShapes: string[];
  possibleTiles: string[];
  numberOfTiles: number;
}

export type LegalVertciesByName = { [name: string]: LegalVertex };

export function calcLegalVertices() {
  const basicShapes = calcBasicShapes();
  const legalVertexDict: { [name: string]: LegalVertex } = {};
  for (let j = 0; j < basicShapes.length; j++) {
    const { tiles, name } = basicShapes[j];
    for (let i = 0; i < Math.pow(2, tiles.length); i++) {
      let p = i;
      const ts = [];
      const missingTiles = [];
      for (let j = 0; j < tiles.length; j++) {
        if (p % 2) {
          ts.push(tiles[j]);
        } else {
          missingTiles.push(tiles[j]);
        }
        p >>= 1;
      }
      let v: Vertex;
      if (ts.length === 0) {
        v = new Vertex(0, 0);
      } else {
        const t = new Tiling(
          ts.map((d) => Tile.createFromVertex(0, 0, d[0] as TileType, d[1] as number, d[2] as number))
        );
        t.build();
        v = t.vertices["0,0"];
      }
      const c = v.tilesCanonicalString();
      let cc = legalVertexDict[c];
      if (!cc) {
        cc = new LegalVertex(c, v.calcType(), ts.length);
        legalVertexDict[c] = cc;
      }
      if (ts.length !== cc.numberOfTiles) {
        console.log("error");
      }
      if (!cc.possibleShapes.find((d) => d === name)) {
        cc.possibleShapes.push(name);
      }
      for (let mt of missingTiles) {
        const n = (mt[0] as TileType).slice(0, 1) + mt[1];
        if (!cc.possibleTiles.find((d) => d === n)) {
          cc.possibleTiles.push(n);
        }
      }
      // console.log(`${i}: ${c}`);
    }
  }
  const legalVertices = Object.values(legalVertexDict);
  legalVertices.sort((d1, d2) => {
    let c = d1.numberOfTiles - d2.numberOfTiles;
    if (c !== 0) {
      return c;
    }
    return d1.name < d2.name ? -1 : 1;
  });
  return legalVertices;
}

// export const legalVertices = calcLegalVertices();

export function calcLegalVerticesByName(legalVertices: LegalVertex[]): LegalVertciesByName {
  return legalVertices.reduce((p, c) => {
  p[c.name] = c;
  return p;
}, {} as LegalVertciesByName);
};
