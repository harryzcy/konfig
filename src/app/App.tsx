import GroupEmpty from '@/components/GroupEmpty'
import SideBar from '@/components/SideBar'
import { Toaster } from '@/components/ui/sonner'
import { StrictMode } from 'react'

export const App = () => {
  return (
    <StrictMode>
      <div className="min-h-screen flex">
        <SideBar />
        <GroupEmpty />
        <Toaster />
      </div>
    </StrictMode>
  )
}
