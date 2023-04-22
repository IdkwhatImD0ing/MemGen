import Image from 'next/image'
import Link from 'next/link'

export default function Navbar() {

  return (
    <nav className="flex text-white items-center justify-centers mr-10">
      <Link href="/" className='mr-auto'><Image src="/memgen.svg" alt='logo' width={200} height={200} /></Link>
      <Link href="/inputdocument" className="px-4 py-2 hover:bg-slate-700 rounded-md font-semibold text-lg mr-2">Input Document</Link>

      <Link href="/api/auth/logout" className="px-6 py-2 text-black bg-white hover:scale-105 active:scale-95 rounded-md font-semibold text-lg">Logout</Link>

    </nav>
  )
}