import Image from "next/image";
import Navbar from "@/components/Navbar";

export default function About() {
  return (
    <main className="relative w-full h-screen flex flex-col items-center text-black">
      <Navbar transparent={false} />
      <div className="w-full sm:w-3xl p-5 my-6 pt-25">
        <h1 className="text-3xl sm:text-5xl font-bold pb-6 border-b">
          Understand The Science
        </h1>

        {/* IDEA */}
        <div className="mt-6 border-b">
          <h2 className="text-lg sm:text-2xl font-semibold">The Idea</h2>
          <p className="my-4">
            My mom has <span className="underline">deuteranopia</span> (form of
            red-green color blindness), and on our trips she'd always squint at
            transit maps, unable to tell the lines apart. That is because she
            has difficulty distinguishing between red and green colors.
          </p>
          <div className="flex flex-row w-full gap-x-3">
            <div>
              <Image
                src="/img/about/map-normal.png"
                alt="map no cvd"
                width={400}
                height={400}
                quality={90}
                style={{ width: "auto", height: "100%" }}
                className="rounded-lg shadow-lg object-cover mb-2"
              />
              <p className="text-center">How I see it</p>
            </div>
            <div>
              <Image
                src="/img/about/map-cvd.jpg"
                alt="map with cvd"
                width={400}
                height={400}
                quality={90}
                style={{ width: "auto", height: "100%" }}
                className="rounded-lg shadow-lg object-cover mb-2"
              />
              <p className="text-center">How she sees it</p>
            </div>
          </div>
          <p className="py-10">
            <span className="font-bold">Then I realized:</span> if I could
            generate palettes optimized for both normal vision and deuteranopia,
            I could try to make maps more usable.
          </p>
        </div>

        {/* SCIENCE */}
        <div className="mt-6 border-b">
          <h2 className="text-lg sm:text-2xl font-semibold mb-4">
            The Science
          </h2>
          <div className="flex flex-col gap-y-3">
            <p>
              When I set out to built this generator, I knew I had to figure out
              3 things:
            </p>
            <ol className="list-decimal list-inside ml-4 gap-y-1">
              <li>A color space where numbers match perception.</li>
              <li>A simulation of color vision deficiency (CVD).</li>
              <li>An optimization that keeps colors “far apart”.</li>
            </ol>
            <h3 className="font-semibold">1. Why Oklab?</h3>
            <p className="ml-4">
              Oklab is a perceptual color space designed so that equal numerical
              moves correspond to equal perceived shifts in hue, chroma, or
              lightness. In sRGB, two colors with the same coordinate difference
              can look wildly different to our eyes, but in Oklab, Euclidean
              distance lines up with how we actually see. That makes it perfect
              for measuring and maximizing “visual distance” between any two
              palette entries.
            </p>
            <h3 className="font-semibold">
              2. Simulating Color Vision Deficiency (CVD)
            </h3>
            <p className="ml-4">
              To recreate deuteranopia, and other forms of color-blindness, I
              paired <span className="italic">Culori</span> ’s color-space
              conversions with the <code>color-blind</code> library. This combo
              gives an exact preview of how each swatch appears to viewers with
              CVD.
            </p>
            <h3 className="font-semibold">3. Maximin Optimization</h3>
            <p className="ml-4 pb-10">
              Rather than simply spreading colors evenly, I posed a “maximin”
              problem: pick n points in Oklab such that the smallest pairwise
              distance, checked under both true-color and simulated-color views,
              is as large as possible. That worst-case guarantee ensures no two
              lines on your map ever look confusingly similar, no matter who’s
              looking.
            </p>
          </div>
        </div>

        {/* RESULTS */}
        <div className="mt-6 border-b">
          <h2 className="text-lg sm:text-2xl font-semibold">Results</h2>
          <p className="my-4">
            The objective was to test whether a Delta Palette-generated color
            set improves route separability for users with deuteranopia compared
            with the standard NYC subway colors.
          </p>
          <h3 className="my-4">
            Here's how the map looks after applying a 12-color palette generated
            by my code:
          </h3>
          <div className="flex flex-row w-full gap-x-3">
            <div>
              <Image
                src="/img/about/map-normal2.jpg"
                alt="map no cvd"
                width={400}
                height={400}
                quality={90}
                style={{ width: "auto", height: "100%" }}
                className="rounded-lg shadow-lg object-cover mb-2"
              />
              <p className="text-center">Normal Vision</p>
            </div>
            <div>
              <Image
                src="/img/about/map-cvd2.jpg"
                alt="map with cvd"
                width={400}
                height={400}
                quality={90}
                style={{ width: "auto", height: "100%" }}
                className="rounded-lg shadow-lg object-cover mb-2"
              />
              <p className="text-center">Deuteranopia</p>
            </div>
          </div>
          <p className="pt-10 mt-5">
            In the simulated view, red/green trunk lines previously merged into
            a single olive tone; the new palette separates them into distinct
            steel-blue and dusty-green.
          </p>
          <h3 className="pb-3 mt-5 font-semibold text-lg">
            Experiment with my friend with red-green partial color blindness:
          </h3>
          <div className="w-full sm:w-3xl mx-auto mb-10">
            <div className="aspect-video w-full rounded-xl overflow-hidden shadow-lg">
              <iframe
                src="https://www.youtube.com/embed/cG8QBCUJcv0"
                title="Testing Delta Palette with Sunny :)"
                allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
              />
            </div>
          </div>
        </div>

        {/* FINAL THOUGHTS */}
        <div className="mt-6 border-b">
          <h2 className="text-lg sm:text-2xl font-semibold">Final Thoughts</h2>

          <p className="my-4">
            Although improving transit‐map legibility for users with
            deuteranopia was my primary motivation, the underlying Delta Palette
            generator can be applied to many other contexts where color
            separability matters. By ensuring each hue is maximally distinct in
            both normal vision and CVD simulations, you can make any
            visualization or interface more accessible.
          </p>

          <h3 className="font-semibold mt-4">Other Potential Applications:</h3>
          <ul className="list-disc list-inside ml-4 my-4 space-y-2">
            <li>
              <span className="font-semibold">Educational Materials: </span>
              Diagrams, instructional posters, or textbooks often use colored
              regions to convey meaning; optimizing those colors can help
              students with partial color blindness follow along without
              confusion.
            </li>
            <li>
              <span className="font-semibold">
                UI Theming & Design Systems:{" "}
              </span>
              Any design system that relies on color coding (buttons, alerts,
              badges) can benefit from a CVD‐friendly palette so that
              interactive elements remain clear for all users.
            </li>

            <li className="mb-10">
              <span className="font-semibold">
                Building Floorplans & Evacuation Routes:{" "}
              </span>
              Emergency signage or interactive floorplans that rely on multiple
              colors (e.g., exit paths, hazard zones) can use something like
              this to guarantee legibility for safety instructions.
            </li>
          </ul>
        </div>

        {/* CREDITS */}
        <div className="mt-6">
          <h2 className="text-lg sm:text-2xl font-semibold mb-4">Credits</h2>
          <div className="flex flex-col gap-3">
            <p>
              Built and maintained by <strong>Felipe Min</strong>.
            </p>
            <p>Useful Resources:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <a
                  href="https://bottosson.github.io/posts/oklab/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline text-blue-400"
                >
                  Oklab
                </a>{" "}
                perceptual color space
              </li>
              <li>
                <a
                  href="https://culorijs.org/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline text-blue-400"
                >
                  Culori
                </a>{" "}
                for color conversions
              </li>
              <li>
                <a
                  href="https://github.com/skratchdot/color-blind"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline text-blue-400"
                >
                  color-blind
                </a>{" "}
                simulation algorithms based on established research
              </li>
              <li>
                <a
                  href="https://www.mathworks.com/matlabcentral/fileexchange/70215-maximally-distinct-color-generator"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline text-blue-400"
                >
                  MAXDISTCOLOR
                </a>{" "}
                greedy algorithm that generates distinctly separated colors
              </li>
            </ul>
            <div className="flex flex-row justify-center gap-x-8 mt-4 pb-10">
              <a
                href="https://github.com/xxfmin/delta-palette"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 hover:opacity-80 transition-opacity"
              >
                <Image
                  src="/img/about/github.png"
                  alt="GitHub Logo"
                  width={24}
                  height={24}
                />
                <span className="text-base font-medium">Source Code</span>
              </a>

              <a
                href="https://www.linkedin.com/in/felipe-min/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 hover:opacity-80 transition-opacity"
              >
                <Image
                  src="/img/about/linkedin.png"
                  alt="LinkedIn Logo"
                  width={24}
                  height={24}
                />
                <span className="text-base font-medium">
                  Connect on LinkedIn
                </span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
