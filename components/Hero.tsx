"use client";

import React, { useState } from "react";
import { HeroBackground } from "./ui/HeroBackground";
import { generatePalette, Mode } from "@/lib/color";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

const Hero = () => {
  const [n, setN] = useState(7);
  const [mode, setMode] = useState<Mode>("normal");
  const [palette, setPalette] = useState<string[]>([]);

  const handleGenerate = () => {
    const newPalette = generatePalette(n, mode);
    setPalette(newPalette);
  };

  return (
    <section className="relative h-screen w-full overflow-hidden">
      <HeroBackground children={undefined} />

      <div className="absolute inset-0 flex flex-col items-center px-5 pt-20">
        <div className="z-10 flex w-full max-w-4xl flex-col items-center text-center">
          <h1 className="text-4xl font-extrabold sm:text-6xl">Delta Palette</h1>
          <p className="mt-2 text-lg text-gray-700 sm:text-xl">
            Colors mathematically spaced&nbsp;to&nbsp;stay&nbsp;distinct—for
            everyone.
          </p>
        </div>

        {palette.length > 0 && (
          <div className="z-10 mt-10 flex w-full px-2">
            <div className="flex w-full gap-2">
              {palette.map((hex) => (
                <div key={hex} className="flex flex-col items-center flex-1">
                  <div
                    className="h-64 w-full rounded-md shadow-md"
                    style={{ backgroundColor: hex }}
                  />
                  <span className="mt-2 w-full text-center font-mono text-sm tracking-wide">
                    {hex.toUpperCase()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="fixed bottom-8 left-1/2 z-20 flex -translate-x-1/2 flex-wrap items-center justify-center gap-4 rounded-md bg-white/70 px-4 py-3 backdrop-blur-sm shadow-lg">
        <Select
          value={n.toString()}
          onValueChange={(val) => setN(parseInt(val, 10))}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder={`# of Colors: ${n}`} />
          </SelectTrigger>
          <SelectContent>
            {Array.from({ length: 12 }, (_, i) => i + 4).map((count) => (
              <SelectItem key={count} value={count.toString()}>
                {count}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={mode} onValueChange={(val) => setMode(val as Mode)}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder={mode} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="normal">Normal vision</SelectItem>
            <SelectItem value="deuteranopia">Deuteranopia</SelectItem>
            <SelectItem value="protanopia">Protanopia</SelectItem>
            <SelectItem value="tritanopia">Tritanopia</SelectItem>
            <SelectItem value="both">Both</SelectItem>
          </SelectContent>
        </Select>

        <button
          onClick={handleGenerate}
          className="rounded-md border bg-white px-4 py-2 font-medium shadow-sm transition hover:bg-gray-100"
        >
          Generate Palette
        </button>
      </div>
    </section>
  );
};

export default Hero;
