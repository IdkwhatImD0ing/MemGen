import { useUser } from "@auth0/nextjs-auth0/client"
import Link from "next/link"
import Image from "next/image"
import Navbar2 from "./components/Navbar2"
import { Inter, Montserrat } from "next/font/google"
import { useEffect, useState } from "react"
import axios from "axios"

const montserrat = Montserrat({ subsets: ['latin'] })

export default function HomePage() {
  const { user, error, isLoading } = useUser()

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>{error.message}</div>;

  useEffect(() => {
    if (!user) {
      window.location.href = "/api/auth/login"
    }
  }, [user])

  const [jobDescription, setJobDescription] = useState("")

  const handleSubmit = async (e) => {
    e.preventDefault()
    const res = await axios.post("/api/coverletter", { jobDescription })
    console.log(res)
  }

  if (user) {
    return (
      <div className={`bg-black text-white min-h-screen px-10 py-2 ${montserrat.className}`}>
        <Navbar2 />
        <div className="flex flex-col gap-8 items-center justify-center">
          <h1 className="text-3xl font-bold mt-10">{`Welcome ${user.name}, let's start building your cover letter`}</h1>
          <div className="flex w-screen min-h-full">
            <form onSubmit={handleSubmit} className="min-w-screen">
              <input
                type="text"
                placeholder="Enter the job description..."
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                className="text-white bg-slate-700 p-2 rounded-md w-[35%] overflow-visible outline-none" 
              />
            </form>
          </div>
        </div>
      </div>
    );
  }
}

