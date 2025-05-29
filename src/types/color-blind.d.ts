declare module "color-blind" {
  /* simulate deuteranopia (green-cone deficiency) on a hex color */
  export function deuteranopia(hex: string): string;
}
