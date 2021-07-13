import { expect } from "chai";

import { VertexType } from "../src/Vertex";
import { calcLegalVertices } from "../src/legalVertices";
import { calcBasicShapes } from "../src/basicShapes";

const legalVertices = calcLegalVertices();
const basicShapes = calcBasicShapes();

describe("legalVertices", () => {
  it("one empty", () => {
    expect(legalVertices.filter((d) => d.name === "E").length).to.equal(1);
  });

  it("total count", () => {
    expect(legalVertices.length).to.equal(98);
  });

  it("head and tile count", () => {
    let vs = legalVertices.filter((d) => d.type === VertexType.Head);
    expect(vs.length).to.equal(53);
    vs = legalVertices.filter((d) => d.type === VertexType.Tail);
    expect(vs.length).to.equal(44);
    vs = legalVertices.filter((d) => d.type === VertexType.Open);
    expect(vs.length).to.equal(1);
    vs = legalVertices.filter((d) => d.type === VertexType.Mixed);
    expect(vs.length).to.equal(0);
  });

  it("full vertices", () => {
    expect(legalVertices.filter((d) => d.possibleTiles.length === 0).length).to.equal(7);
  });

  it("by number of tiles", () => {
    const expecteds = [8, 30, 36, 18, 5];
    for (let i = 0; i < expecteds.length; i++) {
      const vs = legalVertices.filter((d) => d.numberOfTiles === i + 1);
      expect(vs.length).to.equal(expecteds[i]);
      if (i === 4) {
        const ss = vs.map((d) => d.possibleShapes[0]);
        ss.sort();
        expect(ss.join(" ")).to.equal("Jack King Queen Star Sun");
      }
    }
  });

  it("only one possible shape", () => {
    const vs = legalVertices.filter((d) => d.possibleShapes.length === 1);
    expect(vs.length).to.equal(76);
  });

  it("many possible shape but not empty", () => {
    const vs = legalVertices.filter((d) => d.possibleShapes.length > 1 && d.possibleShapes.length < 7);
    expect(vs.length).to.equal(21);
  });

  it("basic shapes check", () => {
    const expecteds = [8, 8, 8, 31, 15, 29, 29];
    basicShapes.forEach(({ name, tiles }, i) => {
      const vs = legalVertices.filter((d) => d.possibleShapes.find((d) => d === name));
      let n = Math.pow(2, tiles.length);
      expect(vs.length).to.equal(expecteds[i]);
    });
  });
});
