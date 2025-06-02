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
  const [n, setN] = useState(5);
  const [mode, setMode] = useState<Mode>("normal");
  const [palette, setPalette] = useState<string[]>([]);

  const handleGenerate = () => {
    const newPalette = generatePalette(n, mode);
    setPalette(newPalette);
  };

  return (
    <section className="relative h-screen w-full overflow-hidden">
      <HeroBackground children={undefined} />

      <div className="absolute inset-0 flex flex-col justify-center items-center px-5">
        <div className="w-full sm:w-3xl flex flex-col items-center text-center z-10 rounded-md p-5">
          <h1 className="font-semibold text-3xl sm:text-5xl pb-2">
            Delta Palette
          </h1>
          <p className="text-lg text-gray-600 sm:text-lg">
            Build a palette of mathematically distinct colors for normal vision
            and color vision deficiency
          </p>

          <div className="flex flex-row items-center gap-x-5 mt-4">
            <Select
              value={n.toString()}
              onValueChange={(val) => setN(parseInt(val, 10))}
            >
              <SelectTrigger className="w-[160px]">
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
              <SelectTrigger className="w-[160px]">
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
          </div>

          <button
            className="mt-6 border px-3 py-2 rounded-sm cursor-pointer"
            onClick={handleGenerate}
          >
            Generate Palette
          </button>

          {palette.length > 0 && (
            <div className="flex space-x-2 mt-6">
              {palette.map((hex) => (
                <div
                  key={hex}
                  className="w-12 h-12 rounded shadow"
                  style={{ backgroundColor: hex }}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default Hero;
