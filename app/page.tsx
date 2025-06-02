import Hero from "@/components/Hero";
import Navbar from "@/components/Navbar";

export default function Home() {
  return (
    <main className="flex flex-col h-screen">
      <Navbar />
      <Hero />
    </main>
  );
}
