import GroupEmpty from '@/app/components/GroupEmpty'
import SideBar from '@/app/components/SideBar'

export default function Home() {
  return (
    <main className="min-h-screen flex">
      <SideBar />
      <GroupEmpty />
    </main>
  )
}
