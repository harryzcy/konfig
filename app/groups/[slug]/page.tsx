'use client'

import GroupView from '@/app/components/GroupView'
import SideBar from '@/app/components/SideBar'
import { Toaster } from '@/components/ui/toaster'

export const runtime = 'edge'

export default function Page({ params }: { params: { slug: string } }) {
  return (
    <div className="min-h-screen flex">
      <SideBar />
      <GroupView groupName={params.slug} />

      <Toaster />
    </div>
  )
}
