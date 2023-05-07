import {useUser} from '@auth0/nextjs-auth0/client'
import {Inter, Montserrat, Oi} from 'next/font/google'
import GenericModal from './components/GenericModal'
import Link from 'next/link'
import React, {useEffect, useState} from 'react'
import axios from 'axios'
import {useRouter} from 'next/router'
import Modal from 'react-modal'
import CircularProgress from '@mui/material/CircularProgress'
import Head from 'next/head'

const montserrat = Montserrat({subsets: ['latin']})

Modal.setAppElement('#__next')

export default function MyDocuments(props) {
  const {user} = useUser()
  const router = useRouter()
  const [loading, setLoading] = useState(0)
  const [loadingMessage, setLoadingMessage] = useState('')
  const [modalIsOpen, setModalIsOpen] = useState(false)
  const [documentToDelete, setDocumentToDelete] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [modalData, setModalData] = useState({})

  const openModal = (id) => {
    setDocumentToDelete(id)
    setModalIsOpen(true)
  }

  const closeModal = () => {
    setModalIsOpen(false)
  }

  const confirmDelete = () => {
    handleDelete(documentToDelete)
    closeModal()
  }

  useEffect(() => {
    if (!user) {
      window.location.href = '/'
    }
  }, [user])

  const [documents, setDocuments] = useState([])

  const fetchDocuments = () => {
    axios
      .get('https://api.art3m1s.me/memgen/documents', {
        params: {
          userid: user.sub,
        },
      })
      .then((res) => {
        if (res.status > 300) {
          setModalData(res.data)
          setShowModal(true)
          return
        }
        setDocuments(res.data)
      })
  }

  useEffect(() => {
    if (user) {
      fetchDocuments()
    }
  }, [user, fetchDocuments])

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
    try {
      setLoading(1)
      setLoadingMessage('Deleting selected document.')
      axios
        .post('https://api.art3m1s.me/memgen/delete', {
          userid: user.sub,
          uuid: id,
        })
        .then((res) => {
          fetchDocuments()
          setLoading(0)
          setLoadingMessage('')
          router.push('/mydocuments')
        })
    } catch (error) {}
  }

  const selectedDocument = documents.find(
    (document) => document.id === router.query.id,
  )

  return (
    <div
      className={`text-white ${montserrat.className} h-screen overflow-hidden bg-fixed bg-black`}
    >
      <Head>
        <link rel="icon" href="/memgen.svg" />
        <title>Documents</title>
      </Head>
      <div className="container mx-auto px-4 pt-32 pb-8 h-full">
        <h1 className="text-4xl font-bold mb-6">My Documents</h1>
        {selectedDocument ? (
          <div className="relative flex items-center justify-center">
            <div
              className="w-1/2 h-1/4 bg-slate-700 p-4 rounded-md overflow-y-scroll"
              style={{
                maxHeight: '60vh',
              }}
            >
              <button
                onClick={() => {
                  router.push('/mydocuments')
                }}
                className="bg-blue-500 text-white p-2 rounded-md mb-4"
              >
                Back
              </button>
              <button
                onClick={() => openModal(selectedDocument.id)}
                className="bg-red-500 text-white p-2 rounded-md mb-4 ml-4"
              >
                Delete
              </button>
              <p>
                <RenderLines text={selectedDocument.text} />
              </p>
            </div>
          </div>
        ) : documents.length > 0 ? (
          <div className="grid grid-cols-3 gap-6 overflow-y-auto max-h-full">
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
        {loading !== 0 && (
          <div className="absolute top-0 w-screen h-screen bg-black bg-opacity-70 flex flex-col items-center justify-center overflow-y-hidden">
            <CircularProgress />
            <p className="mt-4">{loadingMessage}</p>
          </div>
        )}
      </div>
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        className="w-1/3 mx-auto mt-24 bg-slate-700 p-6 rounded-md"
        overlayClassName="fixed inset-0 bg-gray-800 bg-opacity-50"
      >
        <h2 className="text-xl font-bold mb-4">Confirm Delete</h2>
        <p>Are you sure you want to delete this document?</p>
        <div className="flex justify-end mt-6">
          <button
            onClick={confirmDelete}
            className="bg-red-500 text-white px-4 py-2 rounded-md mr-2"
          >
            Delete
          </button>
          <button
            onClick={closeModal}
            className="bg-gray-500 text-white px-4 py-2 rounded-md"
          >
            Cancel
          </button>
        </div>
      </Modal>
      {showModal && (
        <GenericModal data={modalData} onClose={() => setShowModal(false)} />
      )}
    </div>
  )
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
