import useSWR from 'swr'

interface GroupResponse {
  groups: string[]
}

export default function GroupNav() {
  const { data, error, isLoading } = useSWR('/api/groups', async (url) => {
    const res = await fetch(url)
    return (await res.json()) as GroupResponse
  })

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (error) {
    return <div>Failed to load</div>
  }

  if (!data || data.groups.length === 0) {
    return <div>No groups</div>
  }

  return (
    <nav>
      {data?.groups.map((group) => (
        <div key={group}>
          <span>{group}</span>
        </div>
      ))}
    </nav>
  )
}
