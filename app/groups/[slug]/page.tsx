'use client'

import GroupView from '@/app/components/GroupView'
import SideBar from '@/app/components/SideBar'
import { Toaster } from '@/components/ui/toaster'
import { useRouter } from 'next/router'

export const runtime = 'edge'

export default function Page() {
  const router = useRouter()
  return (
    <div className="min-h-screen flex">
      <SideBar />
      <GroupView groupName={router.query.slug as string} />

      <Toaster />
    </div>
  )
}
