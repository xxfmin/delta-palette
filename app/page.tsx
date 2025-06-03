import Hero from "@/components/Hero";
import Navbar from "@/components/Navbar";

export default function Home() {
  return (
    <main className="flex h-screen">
      <Navbar transparent={true} />
      <Hero />
    </main>
  );
}
