// src/pages/index.tsx
import Head from "next/head"
import React from "react"

const Home: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center">
      <Head>
        <title>Tailware</title>
      </Head>

      <main className="text-center">
        <h1 className="text-4xl font-bold mb-4">Welcome to Tailware</h1>
        <p className="text-xl mb-8">
          A powerful tool for inspecting and modifying Tailwind CSS classes in
          real-time.
        </p>
        <div className="space-y-4">
          <p className="text-lg">
            To use Tailware, click on the extension icon in your browser
            toolbar.
          </p>
          <p className="text-lg">
            Then, hover over elements on any webpage to inspect their Tailwind
            classes.
          </p>
        </div>
      </main>

      <footer className="mt-8 text-gray-500">
        <p>© 2023 Tailware. All rights reserved.</p>
      </footer>
    </div>
  )
}

export default Home
