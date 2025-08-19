# Delta Palette

A color palette generator that creates mathematically optimized color sets that remain distinct for everyone, including people with color vision deficiencies.
- [Live Demo](https://delta-palette.vercel.app)

## Overview

Delta Palette generates color palettes using mathematical optimization in the Oklab perceptual color space to ensure maximum distinguishability between colors, both for normal vision and various forms of color blindness (deuteranopia, protanopia, and tritanopia). The project was inspired by the need to make transit maps and data visualizations more accessible to people with color vision deficiencies.

## Features

- **Perceptually Optimized Colors**: Uses the Oklab color space where numerical distances match human perception
- **CVD Simulation**: Real-time simulation of how colors appear to people with different types of color blindness
- **Maximin Algorithm**: Employs a greedy maximin optimization to maximize the minimum distance between any two colors in the palette
- **Dynamic Palette Sizes**: Generate palettes with 4-15 colors
- **Multiple Vision Modes**: Test palettes against normal vision, deuteranopia, protanopia, and tritanopia
- **Interactive UI**: Clean, modern interface with real-time palette generation

## Installation

```bash
# Clone the repository
git clone https://github.com/xxfmin/delta-palette.git
cd delta-palette

# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## Usage

1. Visit the homepage
2. Select the number of colors you want in your palette (4-15)
3. Choose the vision mode to optimize for:
   - Normal vision
   - Deuteranopia (red-green color blindness)
   - Protanopia (red-green color blindness)
   - Tritanopia (blue-yellow color blindness)
4. Click "Generate Palette" to create a new optimized color set
5. Copy the hex codes for use in your projects

## The Algorithm

The palette generation uses a three-step process:

1. **Color Space Selection**: Works in Oklab, a perceptual color space where Euclidean distance corresponds to perceived color difference

2. **CVD Simulation**: Uses established research algorithms to simulate how each color appears under different color vision deficiencies

3. **Maximin Optimization**: 
   - Samples 7500 random colors in sRGB
   - Filters out colors that are too dark (L < 0.2) or too light (L > 0.9) when simulated
   - Seeds with the color farthest from mid-gray for vibrancy
   - Greedily selects colors that maximize the minimum distance to all previously chosen colors
   - Enforces a minimum delta E of 0.2 to ensure distinguishability

### Resources

- [Oklab](https://bottosson.github.io/posts/oklab/) perceptual color space by Björn Ottosson
- [Culori](https://culorijs.org/) for color space conversions
- [color-blind](https://github.com/skratchdot/color-blind) for CVD simulation algorithms
- [MAXDISTCOLOR](https://www.mathworks.com/matlabcentral/fileexchange/70215-maximally-distinct-color-generator) algorithm inspiration
