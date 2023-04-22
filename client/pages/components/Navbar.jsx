import Image from 'next/image'
import Link from 'next/link'

export default function Navbar() {
  return (
    <nav className="flex text-white items-center justify-center">
      <Link href="/" className='mr-auto'><Image src="/memgen.svg" alt='logo' width={200} height={200} /></Link>
      <div className="flex gap-12">
        <Link href="/about">About</Link>
        <Link href="/api/auth/login">Login</Link>
      </div>

    </nav>
  )
}