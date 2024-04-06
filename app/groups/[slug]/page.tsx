import GroupView from '@/app/components/GroupView'
import SideBar from '@/app/components/SideBar'

export default function Page({ params }: { params: { slug: string } }) {
  return (
    <div>
      <SideBar />
      <h1>Group: {params.slug}</h1>

      <GroupView groupName={params.slug} />
    </div>
  )
}
