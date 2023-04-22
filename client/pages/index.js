import Image from 'next/image'
import { Inter, Montserrat } from 'next/font/google'
import Navbar from './components/Navbar'

const inter = Inter({ subsets: ['latin'] })
const montserrat = Montserrat({ subsets: ['latin'] })

export default function Home() {
  return (
    <main className={`bg-black min-h-screen ${montserrat.className}  px-10 py-2`}>
      <Navbar />
    </main>
  )
}
