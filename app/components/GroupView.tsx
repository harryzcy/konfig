'use client'

import GroupLinkEnvironment from './GroupLinkEnvironment'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import { Group } from '@/src/types'
import useSWR from 'swr'

export interface GroupViewProps {
  groupName: string
}

export default function GroupView(props: GroupViewProps) {
  const { groupName } = props

  const {
    data: group,
    error,
    isLoading
  } = useSWR(`/api/groups/${groupName}`, async (url) => {
    const res = await fetch(url)
    const json = await res.json()
    return json as Group
  })

  return (
    <div className="h-screen max-w-full flex-1 pt-4 md:px-8 md:pt-5">
      <div className="flex flex-col h-full">
        <div className="flex flex-col">
          <h1 className="text-lg w-full font-light tracking-wider text-center md:text-left dark:text-white px-2 pb-3 md:px-2 md:pb-4">
            {groupName}
          </h1>
        </div>

        {isLoading && (
          <div className="italic" aria-label="loading">
            Loading...
          </div>
        )}

        {!isLoading && error && <div className="italic">Failed to load</div>}

        {!isLoading && !error && (
          <GroupViewEnvironmentsMenu
            groupName={groupName}
            environments={group?.environments!}
          />
        )}
      </div>
    </div>
  )
}

interface GroupViewEnvironmentsMenuProps {
  groupName: string
  environments: string[]
}

export function GroupViewEnvironmentsMenu(
  props: GroupViewEnvironmentsMenuProps
) {
  const { groupName, environments } = props

  if (!environments || environments.length === 0) {
    return (
      <Dialog>
        <DialogTrigger className="flex-1 pb-4">
          <div className="flex w-full h-full items-center justify-center rounded-md border border-dashed">
            <span className="text-2xl text-center">
              Click to add or link an environment
            </span>
          </div>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="mb-4">
              Add or link an environment
            </DialogTitle>
            <GroupLinkEnvironment
              groupName={groupName}
              currentEnvironments={environments}
            />
          </DialogHeader>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <div>
      {environments.map((env) => {
        return <div key={env}>{env}</div>
      })}
    </div>
  )
}
