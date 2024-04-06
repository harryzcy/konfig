import GroupView from '@/app/components/GroupView'
import SideBar from '@/app/components/SideBar'

export const runtime = 'edge'

export default function Page({ params }: { params: { slug: string } }) {
  return (
    <main className="min-h-screen flex">
      <SideBar />
      <GroupView groupName={params.slug} />
    </main>
  )
}
