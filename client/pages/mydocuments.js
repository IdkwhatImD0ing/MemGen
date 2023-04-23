import {useUser} from '@auth0/nextjs-auth0/client'
import {Inter, Montserrat} from 'next/font/google'
import Link from 'next/link'
import {useEffect, useState} from 'react'
import axios from 'axios'
import {useRouter} from 'next/router'

const montserrat = Montserrat({subsets: ['latin']})

export default function MyDocuments(props) {
  const {user} = useUser()
  const router = useRouter()

  useEffect(() => {
    if (!user) {
      window.location.href = '/'
    }
  }, [user])

  const [documents, setDocuments] = useState([])

  useEffect(() => {
    if (user) {
      axios
        .get('https://api.art3m1s.me/memgen/documents', {
          params: {
            userid: user.sub,
          },
        })
        .then((res) => {
          console.log(res)
          setDocuments(res.data)
        })
    }
  }, [user])

  const truncateText = (text, limit = 20) => {
    const words = text.split(' ')
    if (words.length > limit) {
      return words.slice(0, limit).join(' ') + '...'
    }
    return text
  }
  const handleBoxClick = (id) => {
    router.push(`/mydocuments?id=${id}`)
  }

  const handleDelete = (id) => {
    console.log(`Delete document with id: ${id}`)
    // Call the API to delete the document and update the state.
  }

  const selectedDocument = documents.find(
    (document) => document.id === router.query.id,
  )

  return (
    <div
      className={`text-white ${montserrat.className}`}
      style={{
        background: 'black',
        backgroundAttachment: 'fixed',
        height: '100vh',
      }}
    >
      <div className="container mx-auto px-4" style={{paddingTop: '20vh'}}>
        <h1 className="text-4xl font-bold mb-6">My Documents</h1>
        {selectedDocument ? (
          <div className="relative flex items-center justify-center">
            <div className="w-1/2 h-1/2 bg-slate-700 p-4 rounded-md overflow-y-scroll">
              <button
                onClick={() => handleDelete(selectedDocument.id)}
                className="absolute top-0 right-0 bg-red-500 text-white p-2 rounded-md"
              >
                Delete
              </button>
              <p>{selectedDocument.text}</p>
            </div>
          </div>
        ) : documents.length > 0 ? (
          <div className="grid grid-cols-3 gap-6">
            {documents.map((document) => (
              <div
                key={document.id}
                className="bg-slate-700 p-4 rounded-md cursor-pointer"
                onClick={() => handleBoxClick(document.id)}
              >
                <p>{truncateText(document.text, 20)}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-2xl">
            You have no documents,{' '}
            <Link href="/inputdocuments">
              <span className="text-blue-500 hover:text-blue-300 cursor-pointer">
                go to upload document
              </span>
            </Link>{' '}
            to upload some!
          </div>
        )}
      </div>
    </div>
  )
}
