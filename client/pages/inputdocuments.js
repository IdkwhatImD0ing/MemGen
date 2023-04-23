import {useUser} from '@auth0/nextjs-auth0/client'
import {Inter, Montserrat} from 'next/font/google'
import {useEffect, useState} from 'react'
import {inputDocument} from '@/functions/axios'

const montserrat = Montserrat({subsets: ['latin']})

export default function InputDocuments() {
  const {user} = useUser()

  useEffect(() => {
    if (!user) {
      window.location.href = '/'
    }
  }, [user])

  const [jobDescription, setJobDescription] = useState('')
  const [coverletter, setCoverletter] = useState('')
  const [loading, setLoading] = useState(true)
  const [loading2, setLoading2] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    await inputDocument(user.sub, jobDescription)
  }

  if (user) {
    return (
      <div
        className={`bg-black text-white min-h-screen px-10 py-2 ${montserrat.className}`}
      >
        <div className="flex flex-col gap-8 items-center justify-center">
          <h1 className="text-3xl font-bold mt-10">{`Let's get to know ${user.name}.`}</h1>
          <div className="flex w-screen min-h-full">
            <form
              onSubmit={handleSubmit}
              className="w-screen flex flex-col justify-center items-center gap-8"
            >
              <div className="w-screen flex justify-center items-center gap-4">
                <textarea
                  placeholder="Side projects, previous work roles, technical experiences..."
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  className="text-white bg-slate-700 p-4 rounded-md w-[35%] h-80 overflow-y-auto outline-none resize-none"
                />
              </div>

              <button
                type="submit"
                className="bg-white text-black rounded-xl px-6 py-4 font-bold hover:scale-105 active:scale-95"
              >
                Teach MemGen
              </button>
            </form>
          </div>
        </div>
      </div>
    )
  }
}
