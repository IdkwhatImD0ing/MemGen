import {Inter, Montserrat} from 'next/font/google'
import LandingPage from './components/LandingPage'
import Head from 'next/head'

const inter = Inter({subsets: ['latin']})
const montserrat = Montserrat({subsets: ['latin']})

export default function Home() {
  return (
    <main
      className={`bg-black px-10 py-2 ${montserrat.className}`}
      style={{height: '100vh', overflowY: 'hidden'}}
    >
      <Head>
        <link rel="icon" href="/memgen.svg" />
        <title>Memgen</title>
        {/* Add meta tags */}
        <meta
          name="description"
          content="Revolutionize your job search with Memgen, the intelligent web app that crafts tailored cover letters from your experience, in a snap! Summarize your projects, work history, and resume, and let our advanced vector database find the perfect match for any job description. Stand out from the crowd with personalized, data-driven cover letters that showcase your unique strengths."
        />
        <meta name="author" content="Bill, Trique, Jerry, Sid" />
        <meta
          name="keywords"
          content="memgen, cover letter, resume, job search, cover letter, tailored cover letter, personalized cover letter, resume, work experience, projects, job matching, vector database, job application, career growth, artificial intelligence, data-driven, skills, summary, job description"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />

        {/* Open Graph Protocol */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Memgen" />
        <meta
          property="og:description"
          content="Revolutionize your job search with Memgen, the intelligent web app that crafts tailored cover letters from your experience, in a snap! Summarize your projects, work history, and resume, and let our advanced vector database find the perfect match for any job description. Stand out from the crowd with personalized, data-driven cover letters that showcase your unique strengths."
        />
        <meta property="og:image" content="memgen.svg" />
        <meta property="og:url" content="https://memgen.art3m1s.me" />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Memgen" />
        <meta
          name="twitter:description"
          content="Revolutionize your job search with Memgen, the intelligent web app that crafts tailored cover letters from your experience, in a snap! Summarize your projects, work history, and resume, and let our advanced vector database find the perfect match for any job description. Stand out from the crowd with personalized, data-driven cover letters that showcase your unique strengths."
        />
        <meta name="twitter:image" content="memgen.svg" />
      </Head>
      <LandingPage />
    </main>
  )
}
