export interface GroupViewProps {
  groupName: string
}

export default function GroupView(props: GroupViewProps) {
  const { groupName } = props

  return <div>{groupName}</div>
}
