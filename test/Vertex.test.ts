import { expect } from "chai";

import {
  VertexTile,
  Vertex,
  VertexType,
  Tile,
  coordinateToId,
  Tiling,
  toVertexType,
  vertexTileWidth,
  vertexTilePosition,
  TileType,
} from "../src/Vertex";
import { round, cos36, cos72, sin36, sin72 } from "../src/Math";
import { calcBasicShapes } from "../src/basicShapes";
import { calcLegalVertices } from "../src/legalVertices";

const legalVertices = calcLegalVertices();
const basicShapes = calcBasicShapes();

const { tiles: sunTiles } = basicShapes.find((d) => d.name === "Sun");
const { tiles: starTiles } = basicShapes.find((d) => d.name === "Star");
const { tiles: aceTiles } = basicShapes.find((d) => d.name === "Ace");
const { tiles: jackTiles } = basicShapes.find((d) => d.name === "Jack");
const { tiles: deuceTiles } = basicShapes.find((d) => d.name === "Deuce");
const { tiles: queenTiles } = basicShapes.find((d) => d.name === "Queen");
const { tiles: kingTiles } = basicShapes.find((d) => d.name === "King");

describe("VertexTile", () => {
  it("vertexTileWidth", () => {
    const expecteds = [4, 4, 8, 4, 4, 2, 12, 2];
    expecteds.forEach((d, i) => {
      expect(vertexTileWidth(i <= 3 ? TileType.Kite : TileType.Dart, i % 4)).to.equal(d);
    });
  });
});

describe("Vertex", () => {
  it("tileWidthSum", () => {
    const v = new Vertex(0, 0);
    v.tiles = [
      new VertexTile(0, TileType.Kite, 0), // Jack
      new VertexTile(0, TileType.Kite, 0),
      new VertexTile(0, TileType.Dart, 3),
      new VertexTile(0, TileType.Kite, 2),
      new VertexTile(0, TileType.Dart, 1),
    ];
  });
  it("tileWidthSum of the base shapes", () => {
    basicShapes.forEach(({ tiles }) => {
      const t = new Tiling(
        tiles.map((d) => Tile.createFromVertex(0, 0, d[0] as TileType, d[1] as number, d[2] as number))
      );
      t.build();
      expect(t.vertices["0,0"].tileWidthSum()).to.equal(20);
    });
  });
  it("toVertexType", () => {
    expect(toVertexType(TileType.Kite, 0)).to.equal(VertexType.Tail);
    expect(toVertexType(TileType.Kite, 3)).to.equal(VertexType.Head);
    expect(toVertexType(TileType.Dart, 1)).to.equal(VertexType.Tail);
    expect(toVertexType(TileType.Dart, 2)).to.equal(VertexType.Head);
  });
  it("gapBetween gap", () => {
    const t = new Tiling(
      [
        [TileType.Dart, 0, 0],
        [TileType.Dart, 0, 72],
      ].map((d) => Tile.createFromVertex(0, 0, d[0] as TileType, d[1] as number, d[2] as number))
    );
    t.build();
    const v = t.vertices["0,0"];
    expect(v.tiles.map((d, i) => v.gapBetween(i, (i + 1) % v.tiles.length)).join(" ")).to.equal("0 12");
  });
  it("gapBetween single tiles", () => {
    const expecteds = [16, 16, 12, 16, 16, 18, 8, 18];
    [...Array(8)]
      .map((d, i) => [i <= 3 ? TileType.Kite : TileType.Dart, i % 4, 0])
      .forEach((tile, j) => {
        const t = new Tiling(
          [tile].map((d) => Tile.createFromVertex(0, 0, d[0] as TileType, d[1] as number, d[2] as number))
        );
        t.build();
        const v = t.vertices["0,0"];
        expect(v.gapBetween(0, 0)).to.equal(expecteds[j]);
      });
  });
  it("gapBetween overlap", () => {
    const t = new Tiling(
      [
        [TileType.Dart, 0, 0],
        [TileType.Dart, 0, 18],
      ].map((d) => Tile.createFromVertex(0, 0, d[0] as TileType, d[1] as number, d[2] as number))
    );
    t.build();
    const v = t.vertices["0,0"];
    expect(v.tiles.map((d, i) => v.gapBetween(i, (i + 1) % v.tiles.length)).join(" ")).to.equal("-3 15");
  });
  it("tilesToString", () => {
    const expecteds = ["K0K0D3K2D1", "K0D3K2D1K0", "D3K2D1K0K0", "K2D1K0K0D3", "D1K0K0D3K2"];
    for (let i = 0; i < jackTiles.length; i++) {
      const t = new Tiling(
        jackTiles.map((d) => Tile.createFromVertex(0, 0, d[0] as TileType, d[1] as number, d[2] as number))
      );
      t.build();
      const v = t.vertices["0,0"];
      expect(v.tilesToString(i)).to.equal(expecteds[i]);
    }
  });
  it("tilesCanonicalString", () => {
    const expecteds = ["K0K0K0K0K0", "D0D0D0D0D0", "K1K3D2", "K0K0D3K2D1", "K2K2D1D3", "K1K3K1D0K3", "K1D0D0D0K3"];
    for (let i = 0; i < basicShapes.length; i++) {
      const t = new Tiling(
        basicShapes[i].tiles.map((d) => Tile.createFromVertex(0, 0, d[0] as TileType, d[1] as number, d[2] as number))
      );
      t.build();
      const v = t.vertices["0,0"];
      expect(v.tilesCanonicalString()).to.equal(expecteds[i]);
    }
  });
  it("tilesCanonicalString empty Vertex", () => {
    expect(new Vertex(0, 0).tilesCanonicalString()).to.equal("E");
  });
  it("tilesCanonicalString with gaps", () => {
    const expecteds = ["E", "K1", "K3", "K1K3G12", "D2", "K1G4D2", "K3D2G4", "K1K3D2"];
    const tiles = aceTiles.slice();
    for (let i = 0; i < Math.pow(2, tiles.length); i++) {
      let p = i;
      const ts = [];
      for (let j = 0; j < tiles.length; j++) {
        if (p % 2) {
          ts.push(tiles[j]);
        }
        p >>= 1;
      }
      let v;
      if (ts.length === 0) {
        v = new Vertex(0, 0);
      } else {
        const t = new Tiling(
          ts.map((d) => Tile.createFromVertex(0, 0, d[0] as TileType, d[1] as number, d[2] as number))
        );
        t.build();
        v = t.vertices["0,0"];
      }
      expect(v.tilesCanonicalString()).to.equal(expecteds[i]);
    }
  });
  it("isLegal empty", () => {
    const v = new Vertex(0, 0);
    expect(v.isLegal()).to.equal(true);
  });
  it("isLegal overlap", () => {
    const tiles = [
      [TileType.Kite, 0, 0],
      [TileType.Kite, 0, 54],
    ].map((d) => Tile.createFromVertex(0, 0, d[0] as TileType, d[1] as number, d[2] as number));
    const t = new Tiling(tiles);
    t.build();
    const v = t.vertices["0,0"];
    expect(v.isLegal()).to.equal(false);
    // const g = v.gapBetween(0, 1);
    // console.log(g);
    // console.log(t.vertices["0,0"].tilesCanonicalString());
  });
  it("isLegal mixed types", () => {
    const tiles = [
      [TileType.Kite, 0, 0],
      [TileType.Kite, 1, 72],
    ].map((d) => Tile.createFromVertex(0, 0, d[0] as TileType, d[1] as number, d[2] as number));
    const t = new Tiling(tiles);
    t.build();
    const v = t.vertices["0,0"];
    expect(v.isLegal()).to.equal(false);
  });
  it("isLegal illegal vertices", () => {
    // K3 next to a K3 is illegal
    const tiles = [
      [TileType.Kite, 3, 0],
      [TileType.Kite, 3, 72],
    ].map((d) => Tile.createFromVertex(0, 0, d[0] as TileType, d[1] as number, d[2] as number));
    const t = new Tiling(tiles);
    t.build();
    const v = t.vertices["0,0"];
    expect(v.isLegal()).to.equal(false);
  });
  it("isLegal legalVertices", () => {
    const tiles = sunTiles.map((d) => Tile.createFromVertex(0, 0, d[0] as TileType, d[1] as number, d[2] as number));
    const t = new Tiling(tiles);
    t.build();
    expect(
      Object.values(t.vertices)
        .map((d) => d.isLegal())
        .every((d) => d === true)
    ).to.equal(true);
    // console.log(ss)
  });
  it("possiblePositions K0K0G12", () => {
    const tiles = [
      [TileType.Kite, 0, 0],
      [TileType.Kite, 0, 72],
    ].map((d) => Tile.createFromVertex(0, 0, d[0] as TileType, d[1] as number, d[2] as number));
    const t = new Tiling(tiles);
    t.build();
    const v = t.vertices["0,0"];
    expect(v.possiblePositions(4)).to.deep.equal([8, 10, 12, 14, 16]);
  });
  it("possiblePositions K0G4K0G8", () => {
    const tiles = [
      [TileType.Kite, 0, 0],
      [TileType.Kite, 0, 144],
    ].map((d) => Tile.createFromVertex(0, 0, d[0] as TileType, d[1] as number, d[2] as number));
    const t = new Tiling(tiles);
    t.build();
    const v = t.vertices["0,0"];
    expect(v.possiblePositions(4)).to.deep.equal([4, 12, 14, 16]);
  });
  it("possiblePositions K2D1G10", () => {
    const tiles = [
      [TileType.Kite, 2, -54],
      [TileType.Dart, 1, 90],
    ].map((d) => Tile.createFromVertex(0, 0, d[0] as TileType, d[1] as number, d[2] as number));
    const t = new Tiling(tiles);
    t.build();
    const v = t.vertices["0,0"];
    expect(v.possiblePositions(4)).to.deep.equal([15, 17, 19, 1]);
  });
  it("possiblePositions K2K2G2D3", () => {
    const tiles = [
      [TileType.Kite, 2, 72 + 90],
      [TileType.Kite, 2, -54],
      [TileType.Dart, 3, 18],
    ].map((d) => Tile.createFromVertex(0, 0, d[0] as TileType, d[1] as number, d[2] as number));
    const t = new Tiling(tiles);
    t.build();
    const v = t.vertices["0,0"];
    expect(v.possiblePositions(2)).to.deep.equal([13]);
  });
  it("possiblePositions ace", () => {
    const expecteds = [
      [19, 1, 3],
      [13, 15],
      [7, 9],
    ];
    const tiles = aceTiles.map((d) => Tile.createFromVertex(0, 0, d[0] as TileType, d[1] as number, d[2] as number));
    const t = new Tiling(tiles);
    t.build();
    const vs = Object.values(t.vertices);
    const vt = toVertexType(TileType.Kite, 2);
    let ei = 0;
    for (let i = 0; i < vs.length; i++) {
      const v = vs[i];
      if (v.calcType() === vt) {
        expect(v.possiblePositions(8)).to.deep.equal(expecteds[ei++]);
      }
    }
  });
  it("vertexTileCoordinateAndAngle jackTiles", () => {
    const tiles = jackTiles.map((d) => Tile.createFromVertex(0, 0, d[0] as TileType, d[1] as number, d[2] as number));
    const t = new Tiling(tiles);
    t.build();
    const vs = Object.values(t.vertices);
    for (let j = 0; j < vs.length; j++) {
      const v = vs[j];
      for (let i = 0; i < v.tiles.length; i++) {
        const vt = v.tiles[i];
        const ca = v.vertexTileCoordinateAndAngle(vt.type, vt.corner, vt.position);
        expect(ca.angle).to.almost.equal(vt.tile.angle);
        expect(ca.coordinate.x).to.almost.equal(vt.tile.x);
        expect(ca.coordinate.y).to.almost.equal(vt.tile.y);
      }
    }
  });
  it("vertexTileCoordinateAndAngle basicShapes omit one", () => {
    for (let i = 0; i < basicShapes.length; i++) {
      const b = basicShapes[i];
      const ts = b.tiles;
      for (let omitIndex = 0; omitIndex < ts.length; omitIndex++) {
        const tiles = ts
          .filter((_, i) => i !== omitIndex)
          .map((d) => Tile.createFromVertex(0, 0, d[0] as TileType, d[1] as number, d[2] as number));
        const t = new Tiling(tiles);
        t.build();
        const v = t.vertices["0,0"];
        const [type, corner, angle] = ts[omitIndex];
        const width = vertexTileWidth(type, corner);
        const ps = v.possiblePositions(width);
        expect(ps.length).to.equal(1);
        const ca = v.vertexTileCoordinateAndAngle(type, corner, ps[0]);
        expect(ca.angle).to.almost.equal(angle);
      }
    }
  });
});

describe("Tile", () => {
  it("coordinates", () => {
    const toString = (d: { x: number; y: number }) => `${round(d.x, 2)},${round(d.y, 2)}`;
    let t = new Tile(0, 0, TileType.Kite, 0);
    expect(t.coordinates().map(toString).join(" ")).to.equal("0,0 1,0 0.81,0.59 0.31,0.95");
    t = new Tile(0, 0, TileType.Dart, 0);
    expect(t.coordinates().map(toString).join(" ")).to.equal("0,0 1,0 0.5,0.36 0.31,0.95");
    t = new Tile(0, 0, TileType.Kite, -36);
    expect(t.coordinates().map(toString).join(" ")).to.equal("0,0 0.81,-0.59 1,0 0.81,0.59");
    t = new Tile(0, 0, TileType.Dart, -36);
    expect(t.coordinates().map(toString).join(" ")).to.equal("0,0 0.81,-0.59 0.62,0 0.81,0.59");
    t = new Tile(0.3, 0.4, TileType.Dart, 180);
    expect(t.coordinates().map(toString).join(" ")).to.equal("0.3,0.4 -0.7,0.4 -0.2,0.04 -0.01,-0.55");
  });

  it("coordinateToId", () => {
    expect(coordinateToId({ x: 1, y: 0 })).to.equal("1,0.31");
    expect(coordinateToId({ x: cos72, y: sin72 })).to.equal("0.31,1");
    expect(coordinateToId({ x: cos36, y: sin36 })).to.equal("0.81,0.81");
  });
});

describe("Tiling", () => {
  it("build ace", () => {
    const tiles = aceTiles.map((d) => Tile.createFromVertex(0, 0, d[0] as TileType, d[1] as number, d[2] as number));
    const t = new Tiling(tiles);
    t.build();
    let s = Object.entries(t.vertices).map(
      (d) =>
        `${round(d[1].x, 2)},${round(d[1].y, 2)}: ${d[1].tiles
          .map((e: VertexTile) => e.type.slice(0, 1) + e.corner)
          .join(",")}`
    );
    expect(s.join("\n")).to.equal(
      "0,1: K0,K0\n0,0: K1,K3,D2\n0.59,0.19: K2,D1\n0.95,0.69: K3\n-0.95,0.69: K1\n-0.59,0.19: D3,K2\n0,-0.62: D0"
    );
    s = Object.values(t.vertices).map((d) => `${d.calcType()}`);
    expect(s.join(" ")).to.equal("Tail Head Tail Head Head Tail Head");
    s = Object.values(t.vertices).map((d) => d.tilesCanonicalString());
    s.sort();
    expect(s.join(" ")).to.equal("D0 K0K0G12 K1 K1K3D2 K2D1G10 K2G10D3 K3");
  });

  it("build sun", () => {
    const tiles = sunTiles.map((d) => Tile.createFromVertex(0, 0, d[0] as TileType, d[1] as number, d[2] as number));
    const t = new Tiling(tiles);
    t.build();
    const ts: string[] = [];
    Object.values(t.vertices).forEach((d) => {
      const v = legalVertices.find((e) => e.name === d.tilesCanonicalString());
      const ss = v.possibleShapes.join(" ");
      if (!ts.find((e) => e === ss)) {
        ts.push(ss);
      }
    });
    expect(ts).to.deep.equal(["Sun", "Ace Queen", "Jack Deuce"]);
  });

  it("build tile order", () => {
    const tiles = [4, 3, 2, 1, 0]
      .map((d) => jackTiles[d])
      .map((d) => Tile.createFromVertex(0, 0, d[0] as TileType, d[1] as number, d[2] as number));
    const t = new Tiling(tiles);
    t.build();
    const v = t.vertices["0,0"];
    expect(v.tiles.map((d) => d.position)).to.deep.equal([1, 5, 9, 11, 19]);
  });

  it("vertexTilePosition", () => {
    expect(
      sunTiles.map((d) => vertexTilePosition(d[0] as TileType, d[1] as number, d[2] as number)).join(" ")
    ).to.equal("1 5 9 13 17");
    expect(
      starTiles.map((d) => vertexTilePosition(d[0] as TileType, d[1] as number, d[2] as number)).join(" ")
    ).to.equal("1 5 9 13 17");
    expect(
      aceTiles.map((d) => vertexTilePosition(d[0] as TileType, d[1] as number, d[2] as number)).join(" ")
    ).to.equal("1 5 9");
    expect(
      deuceTiles.map((d) => vertexTilePosition(d[0] as TileType, d[1] as number, d[2] as number)).join(" ")
    ).to.equal("17 5 13 15");
    expect(
      jackTiles.map((d) => vertexTilePosition(d[0] as TileType, d[1] as number, d[2] as number)).join(" ")
    ).to.equal("1 5 9 11 19");
    expect(
      queenTiles.map((d) => vertexTilePosition(d[0] as TileType, d[1] as number, d[2] as number)).join(" ")
    ).to.equal("1 5 9 13 17");
    expect(
      kingTiles.map((d) => vertexTilePosition(d[0] as TileType, d[1] as number, d[2] as number)).join(" ")
    ).to.equal("5 9 13 17 1");
  });

  it("gapBetween", () => {
    // The basic shapes should have all zero gap between
    basicShapes.forEach(({ tiles }) => {
      const t = new Tiling(
        tiles.map((d) => Tile.createFromVertex(0, 0, d[0] as TileType, d[1] as number, d[2] as number))
      );
      t.build();
      const v = t.vertices["0,0"];
      expect(v.tiles.map((d, i) => v.gapBetween(i, (i + 1) % v.tiles.length)).join("")).to.equal(
        "0".repeat(v.tiles.length)
      );
    });
  });

  it("gapBetween basic shapes with gap", () => {
    // The basic shapes with tiles index 1 removed should have gaps
    const expecteds = ["4000", "4000", "40", "4000", "008", "4000", "0400"];
    basicShapes.forEach(({ tiles }, j) => {
      const ts = tiles.slice();
      ts.splice(1, 1);
      const t = new Tiling(
        ts.map((d) => Tile.createFromVertex(0, 0, d[0] as TileType, d[1] as number, d[2] as number))
      );
      t.build();
      const v = t.vertices["0,0"];
      expect(v.tiles.map((d, i) => v.gapBetween(i, (i + 1) % v.tiles.length)).join("")).to.equal(expecteds[j]);
    });
  });

  it("isLegal", () => {
    const tiles = jackTiles.map((d) => Tile.createFromVertex(0, 0, d[0] as TileType, d[1] as number, d[2] as number));
    const t = new Tiling(tiles);
    t.build();
    expect(t.isLegal()).to.equal(true);
  });
});
