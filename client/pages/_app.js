import "@/styles/globals.css";
import { Analytics } from "@vercel/analytics/react";
// pages/_app.js
import React from "react";
import Navbar from "./components/Navbar";
import { UserProvider } from "@auth0/nextjs-auth0/client";
import Head from "next/head";

export default function App({ Component, pageProps }) {
  return (
    <UserProvider>
      <Navbar />
      <Component {...pageProps} />
      <Head>
        <style>{`body, html, #__next { margin: 0; padding: 0; }`}</style>
      </Head>
      <Analytics />
    </UserProvider>
  );
}
