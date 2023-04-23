import {useUser} from '@auth0/nextjs-auth0/client'
import {Inter, Montserrat} from 'next/font/google'
import React from 'react'
import {useEffect, useState} from 'react'
import {getCoverLetter, generate} from '@/functions/axios'
import {PacmanLoader} from 'react-spinners'

const montserrat = Montserrat({subsets: ['latin']})

export default function HomePage() {
  const {user} = useUser()

  useEffect(() => {
    if (!user) {
      window.location.href = '/'
    }
  }, [user])

  const [jobDescription, setJobDescription] = useState('')
  const [coverletter, setCoverletter] = useState('')
  const [loading, setLoading] = useState(false)
  const [loading2, setLoading2] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    const res = await getCoverLetter(user.sub, jobDescription)
    let generateInput = []
    for (let i = 0; i < res.data.length; i++) {
      generateInput.push(res.data[i])
      alert(res.data[i])
    }
    setLoading(false)
    setLoading2(true)
    let finalString = generateInput.join(' ')

    const generateres = await generate(user.sub, jobDescription, finalString)
    setCoverletter(generateres.data)
    setLoading2(false)
  }

  if (user) {
    return (
      <div
        className={`bg-black text-white min-h-screen px-10 py-2 ${montserrat.className}`}
      >
        <div className="flex flex-col gap-8 items-center justify-center">
          <h1 className="text-3xl font-bold mt-10">{`Welcome ${user.name}, let's start building your cover letter.`}</h1>
          <div className="flex w-screen min-h-full">
            <form
              onSubmit={handleSubmit}
              className="w-screen flex flex-col justify-center items-center gap-12"
            >
              <div className="w-screen flex justify-center items-center gap-4">
                <textarea
                  placeholder="Enter the job description..."
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  className="text-white bg-slate-700 p-4 rounded-md w-[35%] h-80 overflow-y-auto outline-none resize-none"
                />

                {loading ? (
                  <div className="text-white bg-slate-700 p-2 rounded-md w-[35%] h-80 flex flex-col items-center justify-center gap-2">
                    <PacmanLoader
                      color={'#ffffff'}
                      loading={loading}
                      size={50}
                    />
                    <div className="flex flex-col justify-center items-center">
                      <p>
                        Searching among your experiences for the best matches
                      </p>
                      <p>to the job description...</p>
                    </div>
                  </div>
                ) : loading2 ? (
                  <div className="text-white bg-slate-700 p-2 rounded-md w-[35%] h-80 flex flex-col items-center justify-center gap-2">
                    <PacmanLoader
                      color={'#ffffff'}
                      loading={loading2}
                      size={50}
                    />

                    <p>Generating your cover letter...</p>
                  </div>
                ) : (
                  <div className="text-white bg-slate-700 p-4 w-[35%] max-w-[35%] h-80 rounded-md overflow-y-scroll">
                    <RenderLines text={coverletter} />
                  </div>
                )}
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
    )
  }
}

function RenderLines({text}) {
  // Remove extra new lines at the beginning of the cover letter
  const trimmedText = text.replace(/^\s*\n+/g, '')
  return trimmedText.split('\n').map((line, index) => (
    <React.Fragment key={index}>
      {line}
      <br />
    </React.Fragment>
  ))
}
