import './App.css'
import GroupEmpty from './components/GroupEmpty'
import SideBar from './components/SideBar'

export default function App() {
  return (
    <div className="min-h-screen flex">
      <SideBar />
      <GroupEmpty />
    </div>
  )
}
