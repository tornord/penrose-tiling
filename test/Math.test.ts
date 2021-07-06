import { sqr, round, sinDeg, cosDeg, twodec, cos36, cos72, sin36, sin72, goldenRatio } from "../src/Math";

const { PI, sqrt } = Math;

describe("Math", () => {
  it("sqr", () => {
    expect(sqr(2)).to.equal(4);
    expect(sqr(-25)).to.equal(625);
    expect(sqr(3.1415)).to.equal(3.1415 * 3.1415);
  });

  it("goldenRatio", () => {
    expect(goldenRatio).to.equal(1.618033988749895);
  });

  it("round", () => {
    expect(round(PI, 1)).to.equal(3.1);
    expect(round(123.45678, 0)).to.equal(123);
    expect(round(123.45678, 1)).to.equal(123.5);
    expect(round(123.45678, 2)).to.equal(123.46);
  });

  it("twodec", () => {
    expect(twodec(PI)).to.equal(3.14);
  });

  it("sinDeg", () => {
    expect(sinDeg(0)).to.almost.equal(0);
    expect(sinDeg(90)).to.almost.equal(1);
    expect(sinDeg(180)).to.almost.equal(0);
    expect(sinDeg(-90)).to.almost.equal(-1);
  });

  it("cosDeg", () => {
    expect(cosDeg(0)).to.almost.equal(1);
    expect(cosDeg(90)).to.almost.equal(0);
    expect(cosDeg(180)).to.almost.equal(-1);
    expect(cosDeg(-90)).to.almost.equal(0);
  });

  it("cos36", () => {
    expect(cos36).to.almost.equal(0.8090169943749475);
  });

  it("cos72", () => {
    expect(cos72).to.almost.equal(0.30901699437494745);
  });

  it("sin36", () => {
    expect(sin36).to.almost.equal(0.5877852522924731);
  });

  it("sin72", () => {
    expect(sin72).to.almost.equal(0.9510565162951535);
  });
});
