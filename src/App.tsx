import React, { useState, useRef } from "react";
import { ReactSVGPanZoom, TOOL_AUTO, INITIAL_VALUE } from "react-svg-pan-zoom";

import { TileType, Point } from "./Vertex";
import { basicShapes } from "./legalVertices";
import "./App.scss";

const { cos, sin, PI, pow, sign, abs, sqrt } = Math;
const sqr = (x: number) => x * x;

function round(x: number, decimals: number) {
  var p = pow(10, decimals);
  return (sign(x) * Math.round(p * abs(x) + 0.01 / p)) / p;
}

const twodec = (x: number) => round(x, 2);

const line = (s: number, v: number) => `l${twodec(s * cos((v / 180) * PI))},${twodec(s * sin((v / 180) * PI))}`;

const goldenRatio = (sqrt(5) + 1) / 2;
const cos36 = goldenRatio / 2;
const cos72 = (goldenRatio - 1) / 2;
const sin36 = sqrt(1 - sqr(cos36));

function tile(
  corner: number,
  vs: number[][],
  x0: number,
  y0: number,
  b: number,
  r1: number,
  isKite: boolean,
  angle: number,
  sideLength: number
) {
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
      <path stroke-linejoin="round" d={`M0,0 ${ws.map((d) => line(s * d[0], d[1])).join(" ")} z`} />
      <path className="circle-2" d={`M${ts(x02)},${ts(y02)} a${s2},${s2},0,${k2},0,${ts(x1)},${ts(y1)}`} />
      <path className="circle-1" d={`M${ts(x01)},${ts(y01)} a${s1},${s1},0,0,1,${ts(x1)},${ts(y1)}`} />
    </g>
  );
}

interface TileProps {
  type: TileType;
  corner: number;
  angle: number;
  sideLength: number;
}

function Tile({ type, corner, angle, sideLength }: TileProps) {
  const r = goldenRatio - 1;
  let vs, b, x0, r1;
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
  return tile(corner, vs, x0, y0, b, r1, type === TileType.Kite, angle, sideLength);
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
  return (
    <>
      <svg className="penrose" viewBox={`0 0 240 135`}>
        {basicShapes.map((d, i) => (
          <g className={d.name.toLowerCase()} transform={`translate(${coords[i].x},${coords[i].y})`}>
            {d.tiles.map((e: any) => (
              <Tile type={e[0]} corner={e[1]} angle={e[2]} sideLength={sideLength} />
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
        onChangeTool={(d: any) => console.log('onChangeTool', d)}
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
            <g className={d.name.toLowerCase()} transform={`translate(${coords[i].x},${coords[i].y})`}>
              {d.tiles.map((e: any) => (
                <Tile type={e[0]} corner={e[1]} angle={e[2]} sideLength={sideLength} />
              ))}
            </g>
          ))}
        </svg>
      </ReactSVGPanZoom>
    </>
  );
}

export default App;
