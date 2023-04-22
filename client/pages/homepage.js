import { useUser } from "@auth0/nextjs-auth0/client";
import Link from "next/link";
import Image from "next/image";
import Navbar2 from "./components/Navbar2";
import { Inter, Montserrat } from "next/font/google";
import { useEffect } from "react";

const montserrat = Montserrat({ subsets: ["latin"] });

export default function HomePage() {
  const { user, error, isLoading } = useUser();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>{error.message}</div>;

  useEffect(() => {
    if (!user) {
      window.location.href = "/api/auth/login";
    }
  }, [user]);

  if (user) {
    return (
      <div
        className={`bg-black text-white min-h-screen px-10 py-2 ${montserrat.className}`}
      >
        <Navbar2 />
        <div className="flex flex-col gap-8 items-center justify-center">
          <h1 className="text-3xl font-bold mt-10">{`Welcome ${user.name}, let's start building your cover letter`}</h1>
          <div className="flex flex-row w-screen min-h-full justify-around">
            <input
              type="textarea"
              placeholder="Enter the job description..."
              className="text-white align-top bg-slate-700 p-2 rounded-xl w-[40%] h-40"
            />
            <input
              type="textarea"
              placeholder="Working on cover letter..."
              className="text-white align-top bg-slate-700 p-2 rounded-xl w-[40%] h-40"
              readOnly
            />
          </div>
          <button className="bg-white text-black rounded-xl px-6 py-4 font-bold">
            Generate
          </button>
        </div>
      </div>
    );
  }
}
