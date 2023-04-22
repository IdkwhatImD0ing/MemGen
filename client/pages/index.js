import Image from "next/image";
import { Inter, Montserrat } from "next/font/google";
import Navbar from "./components/Navbar";
import LandingPage from "./components/LandingPage";

const inter = Inter({ subsets: ['latin'] })

export default function Home() {
  return (
    <main className='bg-black min-h-screen'>
      <Navbar />
      <LandingPage />
    </main>
  );
}
