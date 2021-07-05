const { cos, sin, PI, pow, sign, abs, sqrt } = Math;

export const sqr = (x: number) => x * x;
export const sinDeg = (x: number) => sin((x / 180) * PI);
export const cosDeg = (x: number) => cos((x / 180) * PI);

export function round(x: number, decimals: number) {
  var p = pow(10, decimals);
  return (sign(x) * Math.round(p * abs(x) + 0.01 / p)) / p;
}

export const twodec = (x: number) => round(x, 2);

export const goldenRatio = (sqrt(5) + 1) / 2; // Solution to the quadratic equation x^{2}-x-1=0
export const cos36 = goldenRatio / 2;
export const cos72 = (goldenRatio - 1) / 2;
export const sin36 = sqrt(1 - sqr(cos36));
export const sin72 = sqrt(1 - sqr(cos72));
