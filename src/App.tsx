import React, { useState, useRef } from "react";
import { ReactSVGPanZoom, TOOL_AUTO, INITIAL_VALUE } from "react-svg-pan-zoom";
import { calcBasicShapes } from "./basicShapes";
import { calcLegalVertices } from "./legalVertices";

import { TileType, Point, Tiling, Tile } from "./Vertex";
import "./App.scss";
import { atan2Deg, goldenRatio, cos36, cos72, sin36 } from "./Math";

const { cos, sin, PI, pow, sign, abs } = Math;

function round(x: number, decimals: number) {
  var p = pow(10, decimals);
  return (sign(x) * Math.round(p * abs(x) + 0.01 / p)) / p;
}

const twodec = (x: number) => round(x, 2);

const line = (s: number, v: number) => `l${twodec(s * cos((v / 180) * PI))},${twodec(s * sin((v / 180) * PI))}`;

const basicShapes = calcBasicShapes();
const legalVertices = calcLegalVertices();

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

function App() {
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
  const { tiles: jackTiles } = basicShapes.find((d) => d.name === "Jack");
  const size = 40;
  const jack = new Tiling(
    jackTiles.map((d) => Tile.createFromVertex(0, 0, d[0] as TileType, d[1] as number, d[2] as number))
  );
  jack.build();
  return (
    <>
      <svg className="penrose" viewBox={`0 0 240 135`}>
        <g className={"tiling"} transform={"translate(120, 67.5)"}>
          {jackTiles.map((e: any, j: number) => (
            <ReactTile key={j} type={e[0]} corner={e[1]} angle={e[2]} sideLength={size} />
          ))}
        </g>
        <rect
          className="interaction-layer"
          x={0}
          y={0}
          width={240}
          height={135}
          onMouseMove={(event: any) => {
            const dim = event.target.getBoundingClientRect();
            const svgX = (event.clientX - dim.left) / dim.width;
            const svgY = (event.clientY - dim.top) / dim.height;
            const x = ((svgX - 0.5) * 240) / size;
            const y = ((svgY - 0.5) * 135) / size;
            const v = jack.closestVertex(x, y);
            const t = v?.tilesCanonicalString() || "";
            const legalVertice = legalVertices.find((d) => d.name === t);
            const position = (20 + Math.round((20 * atan2Deg(y - v.y, x - v.x)) / 360)) % 20;
            console.log(
              round(x, 2),
              round(y, 2),
              v,
              position,
              v?.tilesCanonicalString(),
              legalVertice?.possibleTiles.join(",") || "",
              (legalVertice?.possibleShapes?.length || 0) === 1 ? legalVertice.possibleShapes[0] : ""
            );
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
