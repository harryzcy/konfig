import GroupNav from './components/GroupNav'

export default function Home() {
  return (
    <main className="min-h-screenflex">
      <div className="select-none w-60 py-4">
        <div className="px-2">
          <h1 className="text-xl text-center">Konfig</h1>
        </div>

        <GroupNav />
      </div>
    </main>
  )
}
