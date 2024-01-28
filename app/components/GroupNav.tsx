import useSWR from 'swr'

export default function GroupNav() {
  const { data, error, isLoading } = useSWR('/api/groups', async (url) => {
    const res = await fetch(url)
    const data = await res.json()
    console.log(data)
    return data
  })

  if (isLoading) {
    return <div>Loading...</div>
  }

  return (
    <nav>
      <ul>
        {data.map((group: any) => (
          <li key={group.id}>{group.name}</li>
        ))}
      </ul>
    </nav>
  )
}
