import React, { useState, useRef, useEffect } from "react";
import { ReactSVGPanZoom, TOOL_AUTO, INITIAL_VALUE } from "react-svg-pan-zoom";
import { calcBasicShapes } from "./basicShapes";
import { calcLegalVertices, calcLegalVerticesByName } from "./legalVertices";

import { TileType, Point, Tiling, Tile, toVertexType, vertexTileWidth, Vertex, VertexTile } from "./Vertex";
import "./App.scss";
import { atan2Deg, goldenRatio, cos36, cos72, sin36, twodec, cosDeg, sinDeg } from "./Math";

const line = (s: number, v: number) => `l${twodec(s * cosDeg(v))},${twodec(s * sinDeg(v))}`;

const basicShapes = calcBasicShapes();
const legalVertices = calcLegalVertices();
const legalVerticesByName = calcLegalVerticesByName(legalVertices);

interface TileProps {
  type: TileType;
  corner: number;
  angle: number;
  sideLength: number;
}

function ReactTile({ type, corner, angle, sideLength }: TileProps) {
  const r = goldenRatio - 1;
  let vs, b, x0, r1;
  const isKite = type === TileType.Kite;
  if (type === TileType.Kite) {
    vs = [
      [1, -36 + 36],
      [r, 72 + 36],
      [r, 108 + 36],
      [1, -144 + 36],
    ];
    b = r * cos72 + cos36;
    x0 = [0, -cos36, -b, -cos36][corner];
    r1 = r;
  } else {
    // Dart
    vs = [
      [1, -36 + 36],
      [r, 108 + 36],
      [r, 72 + 36],
      [1, -144 + 36],
    ];
    b = -r * cos72 + cos36;
    x0 = [0, -cos36, -b, -cos36][corner];
    r1 = r * (cos72 - 1) + cos36;
  }
  const y0 = [0, sin36, 0, -sin36][corner];
  const ws = [vs[corner], vs[(corner + 1) % 4], vs[(corner + 2) % 4]];
  const s = sideLength;
  const r2 = b - r1;
  const r3 = 2 * s * r1;
  const s1 = twodec(s * r1);
  const s2 = twodec(s * r2);
  const rotate36 = ({ x, y }: Point) => ({ x: x * cos36 - y * sin36, y: x * sin36 + y * cos36 });
  const { x: x01, y: y01 } = rotate36({ x: s * (x0 + r1 * cos36), y: s * (y0 - r1 * sin36) });
  const { x: x02, y: y02 } = rotate36({ x: s * (x0 + b - (isKite ? 1 : -1) * r2 * cos72), y: s * (y0 - r1 * sin36) });
  const { x: x1, y: y1 } = rotate36({ x: 0, y: r3 * sin36 });
  const k2 = isKite ? 0 : 1;
  const ts = twodec;
  return (
    <g className={isKite ? "kite" : "dart"} transform={`rotate(${angle})`}>
      <circle cx={0} cy={0} r={s / 15} />
      <path strokeLinejoin="round" d={`M0,0 ${ws.map((d) => line(s * d[0], d[1])).join(" ")} z`} />
      <path className="circle-2" d={`M${ts(x02)},${ts(y02)} a${s2},${s2},0,${k2},0,${ts(x1)},${ts(y1)}`} />
      <path className="circle-1" d={`M${ts(x01)},${ts(y01)} a${s1},${s1},0,0,1,${ts(x1)},${ts(y1)}`} />
    </g>
  );
}

const startTiles = basicShapes
  .find((d) => d.name === "King")
  .tiles.map((d) => Tile.createFromVertex(0, 0, d[0] as TileType, d[1] as number, d[2] as number));

function App() {
  const [currentTile, setCurrentTile] = useState({ type: TileType.Kite, corner: 0 });
  const [closestPosition, setClosestPosition] = useState(null);
  const [tiles, setTiles] = useState(startTiles);
  const viewer = useRef(null);
  const [value, setValue] = useState(INITIAL_VALUE);

  const sideLength = 25;
  const coords: Point[] = [
    { x: 60, y: 35 },
    { x: 120, y: 35 },
    { x: 180, y: 35 },
    { x: 90, y: 100 },
    { x: 30, y: 100 },
    { x: 150, y: 100 },
    { x: 210, y: 100 },
  ];
  const size = 40;
  const tiling = new Tiling(tiles);
  useEffect(() => {
    window.onkeydown = (ev: KeyboardEvent): any => {
      if (ev.key === "ArrowUp" || ev.key === "ArrowDown") {
        ev.preventDefault();
        const v0 = (currentTile.type === TileType.Kite ? 0 : 4) + currentTile.corner;
        const v1 = (8 + v0 + (ev.key === "ArrowUp" ? 1 : -1)) % 8;
        setCurrentTile({ type: v1 <= 3 ? TileType.Kite : TileType.Dart, corner: v1 % 4 });
      }
    };
  }, [currentTile.type, currentTile.corner]);
  const vertexType = toVertexType(currentTile.type, currentTile.corner);
  const width = vertexTileWidth(currentTile.type, currentTile.corner);
  // let vs = Object.values(jack.vertices).filter((d) => d.tileWidthSum() < 20 && d.calcType() === vertexType);
  // const res: string[] = [];
  // vs.forEach((v) => {
  //   const ps = v.possiblePositions(width);
  //   ps.forEach((p) => {
  //     const vn = new Vertex(v.x, v.y);
  //     vn.tiles = v.tiles.slice(0);
  //     const ca = v.vertexTileCoordinateAndAngle(currentTile.type, currentTile.corner, p);
  //     const tile = new Tile(ca.coordinate.x, ca.coordinate.y, currentTile.type, ca.angle);
  //     vn.tiles.push(new VertexTile(p, currentTile.type, currentTile.corner, tile));
  //     vn.sortTiles();
  //     const name = vn.tilesCanonicalString();
  //     const lv = legalVerticesByName[name];
  //     if (lv) {
  //       res.push(`${vn.calcId()}: ${name}, ${p}`);
  //     }
  //   });
  // });
  let newTile: Tile = null;
  const possiblePositions: number[] = [];
  if (closestPosition) {
    const v = tiling.vertices[closestPosition.id];
    if (v && v.calcType() === vertexType) {
      v.possiblePositions(width).forEach((p) => {
        const vn = new Vertex(v.x, v.y);
        vn.tiles = v.tiles.slice(0);
        const ca = v.vertexTileCoordinateAndAngle(currentTile.type, currentTile.corner, p);
        const tile = new Tile(ca.coordinate.x, ca.coordinate.y, currentTile.type, ca.angle);
        vn.tiles.push(new VertexTile(p, currentTile.type, currentTile.corner, tile));
        vn.sortTiles();
        const name = vn.tilesCanonicalString();
        const lv = legalVerticesByName[name];
        if (lv) {
          possiblePositions.push(p);
          if (closestPosition.position === p) {
            newTile = new Tile(ca.coordinate.x, ca.coordinate.y, currentTile.type, ca.angle);
            const testTiling = new Tiling([...tiles, newTile]);
            if (!testTiling.isLegal()) {
              newTile = null;
            }
          }
        }
      });
    }
  }
  console.log(currentTile, closestPosition, possiblePositions, newTile, tiles.length);
  // console.log(res.join("\n"));
  return (
    <>
      <svg className="penrose" viewBox={`0 0 240 135`}>
        {tiles.map((e: Tile, j: number) => (
          <g className={"tiling"} transform={`translate(${120 + size * e.x}, ${67.5 + size * e.y})`}>
            <ReactTile key={j} type={e.type} corner={0} angle={e.angle} sideLength={size} />
          </g>
        ))}
        {newTile ? (
          <g
            className={"tiling"}
            transform={`translate(${120 + size * closestPosition.x}, ${67.5 + size * closestPosition.y})`}
          >
            <ReactTile type={currentTile.type} corner={currentTile.corner} angle={newTile.angle} sideLength={size} />
          </g>
        ) : null}
        <rect
          className="interaction-layer"
          x={0}
          y={0}
          width={240}
          height={135}
          onClick={(event: any) => {
            if (newTile) {
              const ts = tiles.slice();
              ts.push(newTile);
              setTiles(ts);
            }
          }}
          onMouseMove={(event: any) => {
            const dim = event.target.getBoundingClientRect();
            const svgX = (event.clientX - dim.left) / dim.width;
            const svgY = (event.clientY - dim.top) / dim.height;
            const x = ((svgX - 0.5) * 240) / size;
            const y = ((svgY - 0.5) * 135) / size;
            const v = tiling.closestVertex(x, y);
            if (v) {
              const position = (20 + Math.round((20 * atan2Deg(y - v.y, x - v.x)) / 360)) % 20;
              const id = v.calcId();
              if (!closestPosition || closestPosition.id !== id || closestPosition.position !== position) {
                setClosestPosition({ id, x: v.x, y: v.y, position });
              }
            }
            // const t = v?.tilesCanonicalString() || "";
            // const legalVertice = legalVertices.find((d) => d.name === t);
            // const position = (20 + Math.round((20 * atan2Deg(y - v.y, x - v.x)) / 360)) % 20;
            // console.log(
            //   round(x, 2),
            //   round(y, 2),
            //   v,
            //   position,
            //   v?.tilesCanonicalString(),
            //   legalVertice?.possibleTiles.join(",") || "",
            //   (legalVertice?.possibleShapes?.length || 0) === 1 ? legalVertice.possibleShapes[0] : ""
            // );
          }}
        />
      </svg>
      <svg className="penrose" viewBox={`0 0 240 135`}>
        {basicShapes.map((d, i) => (
          <g key={i} className={d.name.toLowerCase()} transform={`translate(${coords[i].x},${coords[i].y})`}>
            {d.tiles.map((e: any, j: number) => (
              <ReactTile key={j} type={e[0]} corner={e[1]} angle={e[2]} sideLength={sideLength} />
            ))}
          </g>
        ))}
      </svg>
      <ReactSVGPanZoom
        ref={viewer}
        className="penrose"
        width={640}
        height={480}
        tool={TOOL_AUTO}
        value={value}
        onChangeValue={setValue}
        // onZoom={(e) => { console.log('zoom', e); }}
        // onPan={(e) => { console.log('pan', e); }}
        onChangeTool={(d: any) => console.log("onChangeTool", d)}
        // onClick={(e) => {
        //   console.log('click', e.x, e.y);
        //   console.log(
        //     `boundingRect: { x: ${Math.round(Math.min(e.x, prevClick.x))}, y: ${Math.round(
        //       Math.min(e.y, prevClick.y)
        //     )}` +
        //       `, width: ${Math.round(Math.abs(e.x - prevClick.x))}, height: ${Math.round(
        //         Math.abs(e.y - prevClick.y)
        //       )} }`
        //   );
        //   prevClick.x = e.x;
        //   prevClick.y = e.y;
        // }}
        scaleFactor={1.1}
        scaleFactorMin={0.5}
        scaleFactorMax={20}
        scaleFactorOnWheel={1.1}
        toolbarProps={{ position: "none" }}
        miniatureProps={{ position: "none" }}
        detectAutoPan={false}
        background={"#fff"}
      >
        <svg width={240} height={135}>
          {basicShapes.map((d, i) => (
            <g key={i} className={d.name.toLowerCase()} transform={`translate(${coords[i].x},${coords[i].y})`}>
              {d.tiles.map((e: any, j: number) => (
                <ReactTile key={j} type={e[0]} corner={e[1]} angle={e[2]} sideLength={sideLength} />
              ))}
            </g>
          ))}
        </svg>
      </ReactSVGPanZoom>
    </>
  );
}

export default App;
