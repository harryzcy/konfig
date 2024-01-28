'use client'

import { PlusIcon } from '@heroicons/react/24/outline'
import useSWR from 'swr'

interface GroupResponse {
  groups: string[]
}

export default function GroupNav() {
  const { data, error, isLoading } = useSWR('/api/groups', async (url) => {
    const res = await fetch(url)
    return (await res.json()) as GroupResponse
  })

  return (
    <div className="p-2">
      <div className="flex justify-between items-center text-sm pb-2">
        <span>Groups</span>
        <span className="p-1.5 cursor-pointer rounded-md hover:bg-gray-100 hover:dark:bg-gray-700">
          <PlusIcon className="w-4 h-4" />
        </span>
      </div>

      {isLoading && <div className="italic">Loading...</div>}

      {!isLoading && error && <div className="italic">Failed to load</div>}

      {!isLoading && (!data || data.groups.length === 0) && (
        <div className="italic">No groups</div>
      )}

      {data?.groups.map((group) => (
        <div key={group}>
          <span>{group}</span>
        </div>
      ))}
    </div>
  )
}
