import { NextResponse } from "next/server";
import { generatePalette, type Mode } from "@/lib/color";

export function GET(request: Request) {
  // extract search params from the url
  const { searchParams } = new URL(request.url);

  const n = searchParams.get("n") ?? "";
  const mode = (searchParams.get("mode") as Mode) ?? "normal";

  const count = parseInt(n, 10) || 5;

  const palette = generatePalette(count, mode);
  return NextResponse.json({ palette });
}
