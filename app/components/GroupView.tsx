export interface GroupViewProps {
  groupName: string
}

export default function GroupView(props: GroupViewProps) {
  const { groupName } = props

  return (
    <div className="h-screen max-w-full flex-1 pt-4 md:px-8 md:pt-5">
      <div className="flex flex-col h-full">
        <h1 className="text-lg w-full font-light tracking-wider text-center md:text-left dark:text-white px-2 pb-3 md:px-2 md:pb-4">
          {groupName}
        </h1>
      </div>
    </div>
  )
}
