import Image from "next/image";
import Link from "next/link";
import { useUser } from "@auth0/nextjs-auth0/client";

export default function Navbar() {
  const { user } = useUser();

  return (
    <nav className="fixed pl-8 pr-8 top-0 w-full bg-black flex text-white items-center justify-center">
      <Link href="/" className="mr-auto">
        <Image src="/memgen.svg" alt="logo" width={200} height={200} />
      </Link>
      {user ? (
        <div className="flex gap-2 font-semibold text-lg">
          <Link
            href="/mydocuments"
            className="px-4 py-2 hover:bg-slate-700 rounded-md"
          >
            My Documents
          </Link>
          <Link
            href="/inputdocuments"
            className="px-4 py-2 hover:bg-slate-700 rounded-md"
          >
            Upload Document
          </Link>
          <Link
            href="/homepage"
            className="px-4 py-2 hover:bg-slate-700 rounded-md mx-2"
          >
            Letter Generator
          </Link>
          <Link
            href="/api/auth/logout"
            className="px-6 py-2 text-black bg-white hover:scale-105 active:scale-95 rounded-md"
          >
            Logout
          </Link>
        </div>
      ) : (
        <div className="flex gap-2 font-semibold text-lg">
          <Link
            href="/about"
            className="px-4 py-2 hover:bg-slate-700 rounded-md"
          >
            About
          </Link>
          <Link
            href="/api/auth/login"
            className="px-4 py-2 text-black bg-white hover:scale-105 active:scale-95 rounded-md"
          >
            Login
          </Link>
        </div>
      )}
    </nav>
  );
}
