import { TileType } from "./Vertex";

type TileAsArray = [TileType, number, number];

class BasicShape {
  constructor(name: string, tiles: TileAsArray[]) {
    this.name = name;
    this.tiles = tiles;
  }
  name: string;
  tiles: TileAsArray[];
}

export function calcBasicShapes() {
  const sunTiles: TileAsArray[] = [...Array(5)].map((d, i) => [TileType.Kite, 0, 18 + 72 * i + (i <= 2 ? 0 : -360)]);
  const starTiles: TileAsArray[] = [...Array(5)].map((d, i) => [TileType.Dart, 0, 18 + 72 * i + (i <= 2 ? 0 : -360)]);
  const aceTiles: TileAsArray[] = [
    [TileType.Kite, 1, -90],
    [TileType.Kite, 3, -162],
    [TileType.Dart, 2, 54],
  ];
  const deuceTiles: TileAsArray[] = [
    [TileType.Kite, 2, 162],
    [TileType.Kite, 2, -54],
    [TileType.Dart, 1, 90],
    [TileType.Dart, 3, 18],
  ];
  const jackTiles: TileAsArray[] = [
    [TileType.Kite, 0, 18],
    [TileType.Kite, 0, 90],
    [TileType.Dart, 3, -90],
    [TileType.Kite, 2, 54],
    [TileType.Dart, 1, -162],
  ];
  const queenTiles: TileAsArray[] = [
    [TileType.Kite, 1, -90],
    [TileType.Kite, 3, -162],
    [TileType.Kite, 1, 54],
    [TileType.Dart, 0, -126],
    [TileType.Kite, 3, 54],
  ];
  const kingTiles: TileAsArray[] = [
    [TileType.Kite, 1, -18],
    [TileType.Dart, 0, 162],
    [TileType.Dart, 0, -126],
    [TileType.Dart, 0, -54],
    [TileType.Kite, 3, 126],
  ];
  const basicShapeNames = ["Sun", "Star", "Ace", "Jack", "Deuce", "Queen", "King"];
  const basicShapeTiles = [sunTiles, starTiles, aceTiles, jackTiles, deuceTiles, queenTiles, kingTiles];
  return basicShapeNames.map((d, i) => new BasicShape(d, basicShapeTiles[i]));
}
