import { Inter, Montserrat } from "next/font/google";
import LandingPage from "./components/LandingPage";

const inter = Inter({ subsets: ["latin"] });
const montserrat = Montserrat({ subsets: ["latin"] });

export default function Home() {
  return (
    <main
      className={`bg-black px-10 py-2 ${montserrat.className}`}
      style={{ height: "100vh", overflowY: "hidden" }}
    >
      <LandingPage />
    </main>
  );
}
