import { parse, converter, formatHex, Rgb } from "culori";
import * as blinder from "color-blind";

// normalized RGB color (each channel in [0...1])
type Color = {
  r: number;
  g: number;
  b: number;
};

// palette generation/preview mode
export type Mode = "normal" | "deuteranopia" | "both";

/* CONVERTERS SETUP */
const toOklab = converter("oklab"); //sRGB -> Oklab
const toRgb = converter("rgb"); // Oklab -> sRGB

/* PARSERS and FORMATTERS */

// #RRGGBB -> {r, g, b} in [0...1]
export function hexToRgb(hex: string): Color {
  const c = parse(hex);
  if (!c || c.mode !== "rgb") {
    throw new Error(`hexToRgb: couldn't parse "${hex}"`);
  }
  return { r: c.r, g: c.g, b: c.b };
}

// {r, g, b} -> #RRGGBB
export function rgbToHex(color: Color): string {
  // interpret this object as Culori’s Rgb
  const culoriRgb: Rgb = {
    mode: "rgb",
    r: color.r,
    g: color.g,
    b: color.b,
  };

  return formatHex(culoriRgb);
}

/* CORE CONVERSIONS */

// #RRGGBB -> [L, a, b]
export function hexToOklab(hex: string): [number, number, number] {
  const lab = toOklab(hex)!;
  return [lab.l, lab.a, lab.b];
}

// [L, a, b] -> #RRGGBB
export function oklabToHex(L: number, a: number, b: number): string {
  const rgb = toRgb({ mode: "oklab", l: L, a, b }) as {
    r: number;
    g: number;
    b: number;
  };
  return rgbToHex(rgb);
}

/* CVD SIMULATION */

// simulate deuteranopia on {r, g, b}
export function simulateDeuteranopia(color: Color): Color {
  const hex = rgbToHex(color);
  const simulatedHex = blinder.deuteranopia(hex);
  return hexToRgb(simulatedHex);
}

/* DISTANCE CALCULATION */

// euclidean distance in Oklab
function deltaEoklab(
  [L1, a1, b1]: [number, number, number],
  [L2, a2, b2]: [number, number, number]
): number {
  return Math.hypot(L1 - L2, a1 - a2, b1 - b2);
}

export function distance(c1: Color, c2: Color, mode: Mode): number {
  // conver color to culori.rgb
  const asRgb = (c: Color): Rgb => ({
    mode: "rgb",
    r: c.r,
    g: c.g,
    b: c.b,
  });

  if (mode === "normal") {
    const lab1 = toOklab(asRgb(c1))!;
    const lab2 = toOklab(asRgb(c2)!);
    return deltaEoklab([lab1.l, lab1.a, lab1.b], [lab2.l, lab2.a, lab2.b]);
  }
  if (mode === "deuteranopia") {
    const s1 = simulateDeuteranopia(c1);
    const s2 = simulateDeuteranopia(c2);
    const lab1 = toOklab(asRgb(s1))!;
    const lab2 = toOklab(asRgb(s2))!;
    return deltaEoklab([lab1.l, lab1.a, lab1.b], [lab2.l, lab2.a, lab2.b]);
  }
  const dN = distance(c1, c2, "normal");
  const dD = distance(c1, c2, "deuteranopia");
  return Math.min(dN, dD);
}

/* PALETTE GENERATOR
    Greedy Maximin: pick n hex colors that maximize the minimum pairwise euclidean distance
*/
export function generatePalette(n: number, mode: Mode): string[] {
  // clamp n to [1, 25] so we don’t request too few or too many colors
  const target = Math.max(1, Math.min(n, 25));

  // generate 1000 random candidate colors (each channel in [0...1])
  const candidates: Color[] = Array.from({ length: 1000 }, () => ({
    r: Math.random(),
    g: Math.random(),
    b: Math.random(),
  }));
  const white: Color = { r: 1, g: 1, b: 1 };

  const palette: Color[] = [];

  // pick the candidate farthest from white
  {
    let best = candidates[0],
      bestD = -Infinity;
    for (const c of candidates) {
      const d = distance(c, white, mode);
      if (d > bestD) {
        bestD = d;
        best = c;
      }
    }

    // seed it and remove the candidate
    palette.push(best);
    candidates.splice(candidates.indexOf(best), 1);
  }

  // Greedy loop: each time, pick the candidate whose minimum distance
  //              to any already-chosen palette color is maximized
  while (palette.length < target && candidates.length) {
    let best = candidates[0],
      bestD = -Infinity;
    for (const c of candidates) {
      // find the closest (minimum) distance from c to each palette color
      let minD = Infinity;
      for (const p of palette) {
        const d = distance(c, p, mode);
        if (d < minD) {
          minD = d;
          if (!minD) break;
        }
      }
      // keep track of the candidate with the largest “minD”
      if (minD > bestD) {
        bestD = minD;
        best = c;
      }
    }
    // add that best candidate and remove it from further consideration
    palette.push(best);
    candidates.splice(candidates.indexOf(best), 1);
  }

  // convert each color {r, g, b} to hex
  return palette.map(rgbToHex);
}
