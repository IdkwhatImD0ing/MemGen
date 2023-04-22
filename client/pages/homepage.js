import { useUser } from "@auth0/nextjs-auth0/client";
import Link from "next/link";
import Image from "next/image";
import Navbar2 from "./components/Navbar2";
import { Inter, Montserrat } from "next/font/google";
import { useEffect, useState } from "react";
import axios from "axios";
import { getCoverLetter, generate } from "@/functions/axios";
import { PacmanLoader } from "react-spinners";
import Typewriter from "typewriter-effect";

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

  const [jobDescription, setJobDescription] = useState("");
  const [coverletter, setCoverletter] = useState("");
  const [loading, setLoading] = useState(false);
  const [loading2, setLoading2] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const res = await getCoverLetter(user.sub, jobDescription);
    let generateInput = [];
    for (let i = 0; i < res.data.length; i++) {
      generateInput.push(res.data[i]);
      alert(res.data[i]);
    }
    setLoading(false);
    setLoading2(true);
    let finalString = generateInput.join(" ");

    console.log(finalString);

    const generateres = await generate(user.sub, jobDescription, finalString);

    console.log(generateres);

    setCoverletter(generateres.data.body.generations[0].text);
    setLoading2(false);
  };

  const CHUNK_SIZE = 50

  const chunks = coverletter.match(new RegExp(`.{1,${CHUNK_SIZE}}`, "g"));

  if (user) {
    return (
      <div
        className={`bg-black text-white min-h-screen px-10 py-2 ${montserrat.className}`}
      >
        <Navbar2 />
        <div className="flex flex-col gap-8 items-center justify-center">
          <h1 className="text-3xl font-bold mt-10">{`Welcome ${user.name}, let's start building your cover letter.`}</h1>
          <div className="flex w-screen min-h-full">
            <form onSubmit={handleSubmit} className="w-screen flex flex-col justify-center items-center gap-12">
              <div className="w-screen flex justify-center items-center gap-4">
                <input
                  type="text"
                  placeholder="Enter the job description..."
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  className="text-white bg-slate-700 p-2 rounded-md w-[35%] h-80 overflow-visible outline-none"
                />

                {loading ? (
                  <div className="text-white bg-slate-700 p-2 rounded-md w-[35%] h-80 flex flex-col items-center justify-center gap-2">
                    <PacmanLoader
                      color={"#ffffff"}
                      loading={loading}
                      size={50}
                    />
                    <div className="flex flex-col justify-center items-center">
                      <p>Searching among your experiences for the best matches</p>
                      <p>to the job description...</p>
                    </div>

                  </div>
                ) : loading2 ? (
                  <div className="text-white bg-slate-700 p-2 rounded-md w-[35%] h-80 flex flex-col items-center justify-center gap-2">
                    <PacmanLoader
                      color={"#ffffff"}
                      loading={loading2}
                      size={50}
                    />

                    <p>Generating your cover letter...</p>
                  </div>
                ) : (
                  <div className="text-white bg-slate-700 p-4 w-[35%] max-w-[35%] min-h-[100%] rounded-md">
                    <Typewriter
                      onInit={(typewriter) => {
                        typewriter
                          .pauseFor(0)
                          .changeDelay(5)
                          .typeString(coverletter[0])
                          .start();
                        for (let i = 1; i < coverletter.length; i++) {
                          typewriter.typeString(coverletter[i]);
                        }
                      }}
                    />
                  </div>
                )}

                {/* <div className="text-white bg-slate-700 p-2 rounded-md w-[35%] h-80 outline-none">
                  {coverletter}
                </div> */}
              </div>

              <button
                type="submit"
                className="bg-white text-black rounded-xl px-6 py-4 font-bold hover:scale-105 active:scale-95"
              >
                Generate
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }
}
