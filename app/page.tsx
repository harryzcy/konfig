'use client'

import GroupNav from './components/GroupNav'

export default function Home() {
  return (
    <main className="min-h-screen p-4 flex">
      <div className="select-none w-60">
        <div>
          <h1 className="text-xl text-center mb-4">Konfig</h1>
        </div>

        <GroupNav />
      </div>
    </main>
  )
}
