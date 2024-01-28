'use client'

import useSWR from 'swr'

export default function Home() {
  const { data, error, isLoading } = useSWR('/api/groups', async (key) => {
    const res = await fetch(key)
    return await res.json()
  })

  return (
    <main className="min-h-screen p-12 flex">
      <h1 className="text-xl text-center mb-4">Konfig</h1>
      <p className="text-center">Centralized configuration infrastructure</p>
    </main>
  )
}
