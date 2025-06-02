// color-palette-generator.ts

/**
 * This module generates color palettes that remain easily distinguishable
 * under different types of color vision deficiencies (CVD): deuteranopia,
 * protanopia, and tritanopia. It uses Culori to operate in the perceptually
 * uniform Oklab space, and the `color-blind` package to simulate each CVD.
 *
 * We apply several “tweaks” to improve separability:
 *   1. Sample 10,000 random candidate colors in sRGB (normalized [0,1]).
 *   2. Filter out any candidate whose simulated Lightness (L) is too close to
 *      0 (black) or 1 (white) under the chosen CVD (we now use L < 0.20 or L > 0.90).
 *   3. Seed by picking the candidate farthest from mid-gray (0.5, 0.5, 0.5)
 *      in simulated Oklab. This ensures a vibrant first swatch rather than
 *      near-black or near-white.
 *   4. Run a greedy “maximin” loop, always picking the candidate whose minimum ΔE
 *      (simulated Oklab distance) to any already-chosen color is maximized,
 *      while enforcing a minimum ΔE floor (MIN_DELTA_E = 0.20) so that no two colors
 *      get too close under simulation (especially to avoid “yellow vs. teal” collisions).
 */

import { parse, converter, formatHex, Rgb } from "culori";
import * as blinder from "color-blind";

/*─────────────────────────────────────────────────────────────────────────*/
/*                                TYPE DEFINITIONS                          */
/*─────────────────────────────────────────────────────────────────────────*/

/**
 * A normalized RGB color, where each channel is in [0, 1].
 */
type Color = {
  r: number;
  g: number;
  b: number;
};

/**
 * Mode indicates which “vision mode” to optimize for.
 * - "normal": no CVD simulation, just plain Oklab distances.
 * - "deuteranopia": simulate deuteranopia (green-cone deficiency).
 * - "protanopia": simulate protanopia (red-cone deficiency).
 * - "tritanopia": simulate tritanopia (blue-cone deficiency).
 * - "both": take the minimum distance of normal and deuteranopia (if needed).
 */
export type Mode =
  | "normal"
  | "deuteranopia"
  | "protanopia"
  | "tritanopia"
  | "both";

/*─────────────────────────────────────────────────────────────────────────*/
/*                        CONVERTERS AND FORMATTERS                        */
/*─────────────────────────────────────────────────────────────────────────*/

/**
 * Set up Culori converters:
 *  - toOklab: converts an sRGB (or hex) input into Oklab coordinates [L, a, b].
 *  - toRgb: converts Oklab back into sRGB.
 */
const toOklab = converter("oklab"); // sRGB (or hex) → Oklab
const toRgb = converter("rgb"); // Oklab → sRGB

/**
 * asRgb:
 *   Helper to wrap our {r,g,b} into a Culori-compatible Rgb object so we can call toOklab() on it.
 */
const asRgb = (c: Color): Rgb => ({
  mode: "rgb",
  r: c.r,
  g: c.g,
  b: c.b,
});

/**
 * hexToRgb:
 *   Converts a hex string "#RRGGBB" into our normalized Color type {r,g,b},
 *   where each channel is in [0,1]. Internally, Culori’s `parse(hex)`
 *   returns a Culori Rgb object (with r,g,b in [0,1]), so we simply extract.
 */
export function hexToRgb(hex: string): Color {
  const c = parse(hex);
  if (!c || c.mode !== "rgb") {
    throw new Error(`hexToRgb: couldn't parse "${hex}"`);
  }
  return { r: c.r, g: c.g, b: c.b };
}

/**
 * rgbToHex:
 *   Converts our normalized Color ({r,g,b} in [0,1]) back into a "#RRGGBB" string.
 *   We wrap the object as a Culori Rgb (mode:"rgb"), then formatHex.
 */
export function rgbToHex(color: Color): string {
  const culoriRgb: Rgb = {
    mode: "rgb",
    r: color.r,
    g: color.g,
    b: color.b,
  };
  return formatHex(culoriRgb);
}

/**
 * hexToOklab:
 *   Quickly convert a "#RRGGBB" string into [L, a, b] (Oklab) by passing
 *   hex directly to Culori’s converter. We use a non-null assertion because
 *   parse(...) → Oklab is guaranteed for valid hex.
 */
export function hexToOklab(hex: string): [number, number, number] {
  const lab = toOklab(hex)!;
  return [lab.l, lab.a, lab.b];
}

/**
 * oklabToHex:
 *   Convert Oklab coordinates (L, a, b) → an sRGB {r,g,b} → "#RRGGBB".
 *   We rely on Culori’s toRgb to do the heavy lifting, then rgbToHex.
 */
export function oklabToHex(L: number, a: number, b: number): string {
  const rgb = toRgb({ mode: "oklab", l: L, a, b }) as Rgb;
  return rgbToHex({ r: rgb.r, g: rgb.g, b: rgb.b });
}

/*─────────────────────────────────────────────────────────────────────────*/
/*                         CVD SIMULATION FUNCTIONS                         */
/*─────────────────────────────────────────────────────────────────────────*/

/**
 * simulateDeuteranopia:
 *   Given an sRGB {r,g,b}, convert to "#RRGGBB", pass through `blinder.deuteranopia()`,
 *   then parse the resulting hex back into a normalized {r,g,b}. The returned color
 *   is how someone with deuteranopia perceives the original.
 */
export function simulateDeuteranopia(color: Color): Color {
  const hex = rgbToHex(color);
  const simulatedHex = blinder.deuteranopia(hex);
  return hexToRgb(simulatedHex);
}

/**
 * simulateProtanopia:
 *   Same pattern for protanopia. “blinder.protanopia(hex)” returns a hex that
 *   simulates how a protanope sees it. We parse back to normalized {r,g,b}.
 */
export function simulateProtanopia(color: Color): Color {
  const hex = rgbToHex(color);
  const simulatedHex = blinder.protanopia(hex);
  return hexToRgb(simulatedHex);
}

/**
 * simulateTritanopia:
 *   Same pattern for tritanopia. “blinder.tritanopia(hex)” returns a hex simulating
 *   how a tritanope sees it. We parse back to normalized {r,g,b}.
 */
export function simulateTritanopia(color: Color): Color {
  const hex = rgbToHex(color);
  const simulatedHex = blinder.tritanopia(hex);
  return hexToRgb(simulatedHex);
}

/**
 * simulateByMode:
 *   A helper that picks the correct simulation based on the Mode. If mode is
 *   "normal", we just return the original Color (no simulation). For any CVD
 *   mode, we return the simulated version.
 */
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

/*─────────────────────────────────────────────────────────────────────────*/
/*                      DISTANCE (ΔE) IN OKLAB SPACE                       */
/*─────────────────────────────────────────────────────────────────────────*/

/**
 * deltaEoklab:
 *   Compute Euclidean distance between two Oklab triples [L1,a1,b1] and [L2,a2,b2].
 *   This approximates perceptual difference in Oklab space.
 */
function deltaEoklab(
  [L1, a1, b1]: [number, number, number],
  [L2, a2, b2]: [number, number, number]
): number {
  return Math.hypot(L1 - L2, a1 - a2, b1 - b2);
}

/**
 * distance:
 *   Given two normalized Colors (c1, c2) and a Mode, simulate each under the Mode,
 *   convert to Oklab, and return their ΔE. If mode is "both", we take the minimum
 *   distance of normal and deuteranopia as a naive combined metric.
 */
export function distance(c1: Color, c2: Color, mode: Mode): number {
  // If mode is “both”, compare both “normal” and “deuteranopia” and take the smaller ΔE
  if (mode === "both") {
    const dNormal = distance(c1, c2, "normal");
    const dDeut = distance(c1, c2, "deuteranopia");
    return Math.min(dNormal, dDeut);
  }

  // Simulate both colors under the chosen CVD (or keep original if "normal")
  const simC1 = simulateByMode(c1, mode);
  const simC2 = simulateByMode(c2, mode);

  // Convert the simulated RGB to Oklab
  const lab1 = toOklab(asRgb(simC1))!; // [L1, a1, b1]
  const lab2 = toOklab(asRgb(simC2))!; // [L2, a2, b2]

  return deltaEoklab([lab1.l, lab1.a, lab1.b], [lab2.l, lab2.a, lab2.b]);
}

/*─────────────────────────────────────────────────────────────────────────*/
/*                         PALETTE GENERATOR METHOD                         */
/*─────────────────────────────────────────────────────────────────────────*/

/**
 * MIN_DELTA_E:
 *   The minimum allowed ΔE (in simulated Oklab space) between any two chosen colors.
 *   We raise this to 0.20 so that “yellow vs. teal” or any similarly close pair
 *   under tritanopia (or other CVDs) will be rejected.
 */
const MIN_DELTA_E = 0.2;

/**
 * generatePalette:
 *   Generates `n` hex colors that are as far apart as possible under the chosen Mode’s
 *   simulated color vision. We apply multiple “tweaks”:
 *
 *   1. Sample 10,000 random candidate colors in sRGB.
 *   2. Filter out any candidate whose simulated Lightness (L) is too close to 0 or 1
 *      (we now use L < 0.20 or L > 0.90) under the chosen CVD. This rejects near-black and
 *      near-white, so we don’t end up with black/white defaults.
 *   3. Seed by selecting the candidate farthest from mid-gray (0.5, 0.5, 0.5) in simulated Oklab.
 *      This ensures the first swatch is a vivid anchor rather than near-black.
 *   4. Greedy “maximin” loop:
 *       - For each candidate, compute its minimum ΔE (simulated) to any already-chosen color.
 *       - Reject it entirely if that minimum ΔE < MIN_DELTA_E (0.20).
 *       - Among the remaining, pick the one with the largest min ΔE.
 *       - If none remain eligible (all have min ΔE < MIN_DELTA_E), fallback to picking the
 *         one with the largest min ΔE anyway (to avoid failing on high n).
 *   5. Convert the final palette to hex strings and return.
 *
 * @param n - desired palette size (clamped to 1..25)
 * @param mode - one of "normal", "deuteranopia", "protanopia", "tritanopia", "both"
 * @returns string[] - an array of "#RRGGBB" hex colors
 */
export function generatePalette(n: number, mode: Mode): string[] {
  // 1) Clamp n to [1, 25]
  const target = Math.max(1, Math.min(n, 25));

  // 2) Build a large pool of 10,000 random candidates (sRGB),
  //    then filter out any candidate whose simulated Lightness (L)
  //    is too close to 0.20 (black) or 0.90 (white).
  const rawCandidates: Color[] = [];
  while (rawCandidates.length < 10000) {
    const candidate: Color = {
      r: Math.random(),
      g: Math.random(),
      b: Math.random(),
    };

    // Simulate it under the chosen CVD (or leave unchanged if "normal")
    const simulated = simulateByMode(candidate, mode);

    // Convert the simulated version to Oklab
    const labSim = toOklab(asRgb(simulated))!; // [L_sim, a_sim, b_sim]

    // === TWEAKED FILTER: REJECT ANY simulated‐L BELOW 0.20 OR ABOVE 0.90 ===
    // This ensures we never keep a color that becomes too dark (near-black) once simulated,
    // and also excludes near-white (L > 0.90).
    if (labSim.l > 0.2 && labSim.l < 0.9) {
      rawCandidates.push(candidate);
    }
  }

  // 3) Copy into a mutable array that we will remove chosen colors from
  const candidates: Color[] = [...rawCandidates];

  // 4) Choose an initial “seed” color farthest from mid-gray (0.5, 0.5, 0.5) in simulated Oklab.
  //    That way, our first swatch is a vibrant hue instead of near-black or near-white.
  const midGray: Color = { r: 0.5, g: 0.5, b: 0.5 };
  const simGray = simulateByMode(midGray, mode);
  const labGray = toOklab(asRgb(simGray))!; // [L_gray, a_gray, b_gray]

  let seedIndex = 0;
  let bestDistFromGray = -Infinity;

  for (let i = 0; i < candidates.length; i++) {
    const c = candidates[i];
    const simC = simulateByMode(c, mode);
    const labC = toOklab(asRgb(simC))!; // [L_c, a_c, b_c]

    // Compute ΔE between labC and labGray
    const d = deltaEoklab(
      [labC.l, labC.a, labC.b],
      [labGray.l, labGray.a, labGray.b]
    );
    if (d > bestDistFromGray) {
      bestDistFromGray = d;
      seedIndex = i;
    }
  }

  // Initialize the palette with the seed color
  const palette: Color[] = [];
  const firstColor = candidates[seedIndex];
  palette.push(firstColor);
  candidates.splice(seedIndex, 1); // Remove it from further consideration

  // 5) Greedy “maximin” loop with MIN_DELTA_E floor (0.20):
  while (palette.length < target && candidates.length > 0) {
    let bestCandidateIndex = 0;
    let bestMinimumDE = -Infinity;

    // Track whether we found any candidate meeting the floor
    let foundEligible = false;

    // Also track the best overall candidate (for fallback)
    let fallbackIndex = 0;
    let fallbackMinDE = -Infinity;

    // For each candidate, compute its “minimum ΔE” to the palette
    for (let i = 0; i < candidates.length; i++) {
      const c = candidates[i];
      let minDEtoPalette = Infinity;

      // Compute ΔE(simC, simP) for each already-chosen palette color
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

      // Keep track of the best overall candidate (for fallback)
      if (minDEtoPalette > fallbackMinDE) {
        fallbackMinDE = minDEtoPalette;
        fallbackIndex = i;
      }

      // If this candidate meets the minimum ΔE floor (≥ 0.20), consider it “eligible”
      if (minDEtoPalette >= MIN_DELTA_E) {
        if (!foundEligible || minDEtoPalette > bestMinimumDE) {
          foundEligible = true;
          bestMinimumDE = minDEtoPalette;
          bestCandidateIndex = i;
        }
      }
    }

    // If we found any candidate meeting the floor, pick it. Otherwise, fallback.
    const chosenIndex = foundEligible ? bestCandidateIndex : fallbackIndex;
    palette.push(candidates[chosenIndex]);
    candidates.splice(chosenIndex, 1);
  }

  // 6) Convert the final Color palette → array of hex strings and return
  return palette.map((c) => rgbToHex(c));
}

/*─────────────────────────────────────────────────────────────────────────*/
/*                             END OF MODULE                              */
/*─────────────────────────────────────────────────────────────────────────*/
