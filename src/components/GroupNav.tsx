'use client'

import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { useOutsideClick } from '@/hooks/useOutsideClick'
import { PlusIcon } from '@heroicons/react/24/outline'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import useSWR from 'swr'
import { z } from 'zod'

interface GroupListResponse {
  groups: string[]
}

const NewGroupFormSchema = z.object({
  group: z.string().min(1, {
    message: 'Group name should not be empty'
  })
})

export default function GroupNav() {
  const { data, error, isLoading, mutate } = useSWR(
    '/api/groups',
    async (url) => {
      const res = await fetch(url)
      return (await res.json()) as GroupListResponse
    }
  )

  const [isDraftActive, setIsDraftActive] = useState<boolean>(false)

  return (
    <div className="p-4">
      <div className="flex justify-between items-center text-sm pb-2">
        <span>Groups</span>
        <span
          className="p-1.5 cursor-pointer rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
          onClick={() => {
            setIsDraftActive(true)
          }}
        >
          <PlusIcon className="w-4 h-4" aria-label="add group" />
        </span>
      </div>

      {isLoading && (
        <div className="italic" aria-label="loading">
          Loading...
        </div>
      )}

      {!isLoading && error && <div className="italic">Failed to load</div>}

      {!isLoading && (!data || data.groups.length === 0) && !isDraftActive && (
        <div className="italic">No groups</div>
      )}

      {isDraftActive && (
        <NewGroupForm
          create={(group) => {
            const original = data?.groups ?? []
            mutate({ groups: [...original, group] })
          }}
          cancel={() => {
            setIsDraftActive(false)
          }}
        />
      )}

      {data?.groups.sort().map((group) => (
        <div key={group} className="">
          <Button variant="outline" asChild className="px-2 w-full">
            <a href={`groups/${group}`}>{group}</a>
          </Button>
        </div>
      ))}
    </div>
  )
}

function NewGroupForm(props: {
  create: (group: string) => void
  cancel: () => void
}) {
  const newGroupForm = useForm<z.infer<typeof NewGroupFormSchema>>({
    resolver: zodResolver(NewGroupFormSchema),
    defaultValues: {
      group: ''
    }
  })

  const onSubmit = async (data: z.infer<typeof NewGroupFormSchema>) => {
    const res = await fetch('/api/groups', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: data.group
      })
    })
    if (!res.ok) {
      console.error('Failed to create group')
    }
    props.create(data.group)
    newGroupForm.reset()
    props.cancel()
  }

  const formRef = useRef<HTMLFormElement>(null)
  const submitRef = useRef<HTMLInputElement>(null)
  useOutsideClick(formRef, () => {
    if (newGroupForm.getValues().group === '') {
      newGroupForm.reset()
      props.cancel()
    } else {
      submitRef.current?.click()
    }
  })

  return (
    <Form {...newGroupForm}>
      <form onSubmit={newGroupForm.handleSubmit(onSubmit)} ref={formRef}>
        <FormField
          control={newGroupForm.control}
          name="group"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input placeholder="Type group name here" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <input className="hidden" type="submit" ref={submitRef} />
      </form>
    </Form>
  )
}
