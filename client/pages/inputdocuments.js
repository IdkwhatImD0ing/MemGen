import {useUser} from '@auth0/nextjs-auth0/client'
import {Inter, Montserrat} from 'next/font/google'
import {useEffect, useState} from 'react'
import {inputDocument, convertPDF} from '@/functions/axios'
import Alert from '@mui/material/Alert'
import axios from 'axios'
import CircularProgress from '@mui/material/CircularProgress'

const montserrat = Montserrat({subsets: ['latin']})

export default function InputDocuments() {
  const {user} = useUser()

  useEffect(() => {
    if (!user) {
      window.location.href = '/'
    }
  }, [user])
  const [jobDescription, setJobDescription] = useState('')
  const [fileName, setFileName] = useState('UploadPDF')
  const [loading, setLoading] = useState(0)
  const [loadingMessage, setLoadingMessage] = useState('')
  const [formData, setFormData] = useState(null)
  const changeHandler = (event) => {
    const file = event.target.files[0] // Get the first file from the file input
    if (file) {
      setFileName(file.name)
    }

    // Create a FormData object
    const FD = new FormData()
    FD.append('pdf', file) // Append the file to the FormData object with the desired field name, in this case "file_upload"
    setFormData(FD)

    // Make the Axios POST request with the FormData object as the data
  }
  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      let text = null
      if (formData != null) {
        setLoading(1)
        setLoadingMessage(
          "Converting PDF to text, please don't navigate away. This can take up to one minute.",
        )
        text = await convertPDF(formData)
      }
      setLoading(1)
      setLoadingMessage(
        "Summarizing your text, please don't navigate away. This can take up to one minute.",
      )
      axios
        .post('https://api.art3m1s.me/memgen/summarize', {
          text: text ? text : jobDescription,
          userid: user.sub,
        })
        .then((res) => {
          setLoading(2)
          setLoadingMessage('Embedding summary into vector database.')
          inputDocument(user.sub, res.data.data.body.generations[0].text).then(
            (res) => {
              setLoading(0)
              setLoadingMessage('')
              setJobDescription('')
            },
          )
        })
    } catch (error) {}
  }
  if (user) {
    return (
      <div
        className={`bg-black text-white min-h-screen px-10 py-2 overflow-hidden ${montserrat.className}`}
      >
        <div className="flex flex-col gap-8 items-center justify-center">
          <h1 className="text-3xl font-bold mt-10">{`Let's get to know ${user.name}.`}</h1>
          <div className="flex w-screen min-h-full">
            <form
              onSubmit={handleSubmit}
              className="w-screen flex flex-col justify-center items-center gap-8"
            >
              <div className="w-screen flex justify-center items-center gap-4">
                <label className="px-6 py-2 text-white justify-center hover:scale-105 active:scale-95 w-[35%] h-80 rounded-xl font-semibold border-4 border-dashed flex items-center">
                  <span className="mx-auto">{fileName}</span>
                  <input
                    type="file"
                    name="file_upload"
                    className="hidden"
                    onChange={changeHandler}
                  />
                </label>
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
            {loading !== 0 && (
              <div className="absolute top-0 w-screen h-screen bg-black bg-opacity-70 flex flex-col items-center justify-center overflow-y-hidden">
                <CircularProgress />
                <p className="mt-4">{loadingMessage}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }
}
