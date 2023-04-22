import Image from 'next/image'
import Link from 'next/link'

export default function Navbar() {

  return (
    <nav className="flex text-white items-center justify-center">
      <Link href="/" className='mr-auto'><Image src="/memgen.svg" alt='logo' width={200} height={200} /></Link>
      <div className="flex gap-2 font-semibold text-lg">
        <Link href="/about" className="px-4 py-2 hover:bg-slate-700 rounded-md">About</Link>
        <Link href="/api/auth/login" className="px-4 py-2 hover:bg-slate-700 rounded-md">Login</Link>
        <Link href="/api/auth/login" className="px-6 py-2 text-black bg-white hover:scale-105 active:scale-95 rounded-md">Get Started</Link>
      </div>

    </nav>
  )
}