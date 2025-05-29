import GradientBackground from "@/components/ui/AboutBackground/GradientBackground";

export default function About() {
  return (
    <div className="relative w-full h-screen flex items-center justify-center text-white">
      <GradientBackground />
      <div className="z-10 text-center">
        <h1 className="text-5xl font-bold">Understand the Science</h1>
        <p className="text-xl mt-4">Dynamic, Accessible, Colorful</p>
      </div>
    </div>
  );
}
