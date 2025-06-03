import { parse, converter, formatHex, Rgb } from "culori";
import * as blinder from "color-blind";

type Color = {
  r: number;
  g: number;
  b: number;
};

/**
"normal": no CVD simulation
"deuteranopia": green-cone deficiency)
"protanopia": red-cone deficiency)
"tritanopia": blue-cone deficiency)
"both": take the minimum distance of normal and deuteranopia
 */
export type Mode =
  | "normal"
  | "deuteranopia"
  | "protanopia"
  | "tritanopia"
  | "both";


/*                        CONVERTERS AND FORMATTERS                        */

// Culori converters
const toOklab = converter("oklab"); // sRGB -> Oklab
const toRgb = converter("rgb");     // Oklab -> sRGB

// helper to wrap {r,g,b} into a Culori compatible Rgb object
const asRgb = (c: Color): Rgb => ({
  mode: "rgb",
  r: c.r,
  g: c.g,
  b: c.b,
});

// converts a hex string "#RRGGBB" into {r,g,b}
export function hexToRgb(hex: string): Color {
  const c = parse(hex);
  if (!c || c.mode !== "rgb") {
    throw new Error(`hexToRgb: couldn't parse "${hex}"`);
  }
  return { r: c.r, g: c.g, b: c.b };
}

// converts {r,g,b} back into a "#RRGGBB" string.
export function rgbToHex(color: Color): string {
  const culoriRgb: Rgb = {
    mode: "rgb",
    r: color.r,
    g: color.g,
    b: color.b,
  };
  return formatHex(culoriRgb);
}

// converts "#RRGGBB" into [L, a, b] (Oklab)
export function hexToOklab(hex: string): [number, number, number] {
  const lab = toOklab(hex)!;
  return [lab.l, lab.a, lab.b];
}

// converts Oklab coordinates (L, a, b) → an sRGB {r,g,b} → "#RRGGBB"
export function oklabToHex(L: number, a: number, b: number): string {
  const rgb = toRgb({ mode: "oklab", l: L, a, b }) as Rgb;
  return rgbToHex({ r: rgb.r, g: rgb.g, b: rgb.b });
}

/*                         CVD SIMULATION                                 */

export function simulateDeuteranopia(color: Color): Color {
  const hex = rgbToHex(color);
  const simulatedHex = blinder.deuteranopia(hex);
  return hexToRgb(simulatedHex);
}

export function simulateProtanopia(color: Color): Color {
  const hex = rgbToHex(color);
  const simulatedHex = blinder.protanopia(hex);
  return hexToRgb(simulatedHex);
}

export function simulateTritanopia(color: Color): Color {
  const hex = rgbToHex(color);
  const simulatedHex = blinder.tritanopia(hex);
  return hexToRgb(simulatedHex);
}

// helper that picks the correct simulation based on the Mode
function simulateByMode(color: Color, mode: Mode): Color {
  switch (mode) {
    case "deuteranopia":
      return simulateDeuteranopia(color);
    case "protanopia":
      return simulateProtanopia(color);
    case "tritanopia":
      return simulateTritanopia(color);
    default:
      // "normal" or "both" (temporarily treat "both" as "normal" here)
      return color;
  }
}

/*                      DISTANCE (Eucliden Distance) IN OKLAB SPACE                       */

// computes Euclidean distance between two Oklab triples [L1,a1,b1] and [L2,a2,b2]
function deltaEoklab(
  [L1, a1, b1]: [number, number, number],
  [L2, a2, b2]: [number, number, number]
): number {
  return Math.hypot(L1 - L2, a1 - a2, b1 - b2);
}

export function distance(c1: Color, c2: Color, mode: Mode): number {
  if (mode === "both") {
    const dNormal = distance(c1, c2, "normal");
    const dDeut = distance(c1, c2, "deuteranopia");
    return Math.min(dNormal, dDeut);
  }

  // simulate both colors under the chosen CVD
  const simC1 = simulateByMode(c1, mode);
  const simC2 = simulateByMode(c2, mode);

  // convert the simulated RGB to Oklab
  const lab1 = toOklab(asRgb(simC1))!; // [L1, a1, b1]
  const lab2 = toOklab(asRgb(simC2))!; // [L2, a2, b2]

  return deltaEoklab([lab1.l, lab1.a, lab1.b], [lab2.l, lab2.a, lab2.b]);
}

/*                         PALETTE GENERATOR METHOD                         */

/**
 * MIN_DELTA_E:
 *   the minimum allowed Euclidean Distance difference between any two chosen colors.
 *   raised this to 0.20 so that “yellow vs. teal” or any similarly close pair
 *   under tritanopia (or other CVDs) will be rejected.
 */
const MIN_DELTA_E = 0.20;

/**
 *   1. sample 10,000 random candidate colors in sRGB.
 *   2. filter out any candidate whose simulated Lightness (L) is too close to 0 or 1
 *      (we now use L < 0.20 or L > 0.90) under the chosen CVD. This rejects near-black and
 *      near-white, so we don’t end up with black/white defaults.
 *   3. seed by selecting the candidate farthest from mid-gray (0.5, 0.5, 0.5) in simulated Oklab.
 *      this ensures the first swatch is a vivid anchor rather than near-black.
 *   4. greedy “maximin” loop:
 *       - for each candidate, compute its minimum ΔE (simulated) to any already-chosen color.
 *       - reject it entirely if that minimum ΔE < MIN_DELTA_E (0.20).
 *       - among the remaining, pick the one with the largest min ΔE.
 *       - if none remain eligible (all have min ΔE < MIN_DELTA_E), fallback to picking the
 *         one with the largest min ΔE anyway (to avoid failing on high n).
 *   5. convert the final palette to hex strings and return.
 */
export function generatePalette(n: number, mode: Mode): string[] {
  // 1) clamp n to [1, 25]
  const target = Math.max(1, Math.min(n, 25));

  // 2) build a large pool of 10,000 random candidates (sRGB),
  //    then filter out any candidate whose simulated Lightness (L)
  //    is too close to 0.20 (black) or 0.90 (white).
  const rawCandidates: Color[] = [];
  while (rawCandidates.length < 10000) {
    const candidate: Color = {
      r: Math.random(),
      g: Math.random(),
      b: Math.random(),
    };

    // simulate it under the chosen CVD (or leave unchanged if "normal")
    const simulated = simulateByMode(candidate, mode);

    // convert the simulated version to Oklab
    const labSim = toOklab(asRgb(simulated))!; // [L_sim, a_sim, b_sim]

    // reject any simulated‐L below 0.20 OR above 0.90 
    // this ensures we never keep a color that becomes too dark (near-black) once simulated,
    // and also excludes near-white (L > 0.90).
    if (labSim.l > 0.20 && labSim.l < 0.90) {
      rawCandidates.push(candidate);
    }
  }

  // 3) copy into a mutable array that will remove chosen colors from
  const candidates: Color[] = [...rawCandidates];

  // 4) choose an initial “seed” color farthest from mid-gray (0.5, 0.5, 0.5) in simulated Oklab.
  //    that way, the first swatch is a vibrant hue instead of near-black or near-white.
  const midGray: Color = { r: 0.5, g: 0.5, b: 0.5 };
  const simGray = simulateByMode(midGray, mode);
  const labGray = toOklab(asRgb(simGray))!; // [L_gray, a_gray, b_gray]

  let seedIndex = 0;
  let bestDistFromGray = -Infinity;

  for (let i = 0; i < candidates.length; i++) {
    const c = candidates[i];
    const simC = simulateByMode(c, mode);
    const labC = toOklab(asRgb(simC))!; // [L_c, a_c, b_c]

    // compute ΔE between labC and labGray
    const d = deltaEoklab(
      [labC.l, labC.a, labC.b],
      [labGray.l, labGray.a, labGray.b]
    );
    if (d > bestDistFromGray) {
      bestDistFromGray = d;
      seedIndex = i;
    }
  }

  // initialize the palette with the seed color
  const palette: Color[] = [];
  const firstColor = candidates[seedIndex];
  palette.push(firstColor);
  candidates.splice(seedIndex, 1); // Remove it from further consideration

  // 5) greedy “maximin” loop with MIN_DELTA_E floor (0.20):
  while (palette.length < target && candidates.length > 0) {
    let bestCandidateIndex = 0;
    let bestMinimumDE = -Infinity;

    // track whether we found any candidate meeting the floor
    let foundEligible = false;

    // also track the best overall candidate (for fallback)
    let fallbackIndex = 0;
    let fallbackMinDE = -Infinity;

    // for each candidate, compute its “minimum ΔE” to the palette
    for (let i = 0; i < candidates.length; i++) {
      const c = candidates[i];
      let minDEtoPalette = Infinity;

      // compute ΔE(simC, simP) for each already-chosen palette color
      for (const p of palette) {
        const simC = simulateByMode(c, mode);
        const simP = simulateByMode(p, mode);

        const labC = toOklab(asRgb(simC))!;
        const labP = toOklab(asRgb(simP))!;

        const d = deltaEoklab(
          [labC.l, labC.a, labC.b],
          [labP.l, labP.a, labP.b]
        );
        if (d < minDEtoPalette) {
          minDEtoPalette = d;
          if (minDEtoPalette === 0) break;
        }
      }

      // keep track of the best overall candidate (for fallback)
      if (minDEtoPalette > fallbackMinDE) {
        fallbackMinDE = minDEtoPalette;
        fallbackIndex = i;
      }

      // if this candidate meets the minimum difference floor (≥ 0.20), consider it “eligible”
      if (minDEtoPalette >= MIN_DELTA_E) {
        if (!foundEligible || minDEtoPalette > bestMinimumDE) {
          foundEligible = true;
          bestMinimumDE = minDEtoPalette;
          bestCandidateIndex = i;
        }
      }
    }

    // if we found any candidate meeting the floor, pick it. Otherwise, fallback.
    const chosenIndex = foundEligible ? bestCandidateIndex : fallbackIndex;
    palette.push(candidates[chosenIndex]);
    candidates.splice(chosenIndex, 1);
  }

  // 6) convert the final Color palette -> array of hex strings and return
  return palette.map((c) => rgbToHex(c));
}
