import Image from "next/image";
import GradientBackground from "@/components/ui/AboutBackground/GradientBackground";

export default function About() {
  return (
    <main className="relative w-full h-screen flex flex-col items-center text-black">
      <div>
        <GradientBackground />
      </div>
      <div className="w-full sm:w-3xl p-5">
        <h1 className="text-3xl sm:text-5xl font-bold pb-6 border-b">
          Understand the Science
        </h1>

        {/* IDEA */}
        <div className="mt-6 border-b">
          <h2 className="text-lg sm:text-2xl font-semibold">
            Idea behind this:
          </h2>
          <p className="my-4">
            My mom has <span className="underline">deuteranopia</span>{" "}
            (red-green color blindness), and on our trips she'd always squint at
            transit maps, unable to tell the lines apart. That is because she
            has difficulty distinguishing between red and green colors.
          </p>
          <div className="flex flex-row w-full gap-x-4">
            <div>
              <Image
                src="/img/about/map-normal.png"
                alt="Felipe Min headshot"
                width={400}
                height={400}
                quality={90}
                style={{ width: "auto", height: "100%" }}
                className="rounded-lg shadow-lg object-cover"
              />
              <p className="text-center">How I see it</p>
            </div>
            <div>
              <Image
                src="/img/about/map-cvd.jpg"
                alt="Felipe Min headshot"
                width={400}
                height={400}
                quality={90}
                style={{ width: "auto", height: "100%" }}
                className="rounded-lg shadow-lg object-cover"
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
          <h2 className="text-lg sm:text-2xl font-semibold">The Science:</h2>
          <p className="my-4">
            My mom has <span className="underline">deuteranopia</span>{" "}
            (red-green color blindness), and on our trips she'd always squint at
            transit maps, unable to tell the lines apart. That is because she
            has difficulty distinguishing between red and green colors.
          </p>
        </div>
      </div>
    </main>
  );
}
