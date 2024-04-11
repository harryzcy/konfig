'use client'

import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from '@/components/ui/command'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel
} from '@/components/ui/form'
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover'
import { toast } from '@/components/ui/use-toast'
import { cn } from '@/lib/utils'
import { GroupValue, NewEnvironmentRequest } from '@/src/types'
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/24/outline'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import useSWR from 'swr'
import useSWRMutation from 'swr/mutation'
import { z } from 'zod'

interface GroupLinkEnvironmentProps {
  groupName: string
  currentEnvironments: string[]
}

export default function GroupLinkEnvironment(props: GroupLinkEnvironmentProps) {
  const { groupName, currentEnvironments } = props

  const { data, error, isLoading } = useSWR(
    `/api/environments`,
    async (url) => {
      const res = await fetch(url)
      const json = await res.json()
      return json as { environments: string[] }
    }
  )
  const environments = useMemo(() => data?.environments ?? [], [data])

  const [open, setOpen] = useState(false)

  const [inputValue, setInputValue] = useState('')
  const environmentsAndInput = useMemo(() => {
    const originalEnvironments = environments.map((env) => {
      return {
        environment: env,
        isNew: false
      }
    })

    if (!inputValue) {
      return originalEnvironments
    }
    if (environments.includes(inputValue)) {
      return originalEnvironments
    }
    return [
      {
        environment: inputValue,
        isNew: true
      },
      ...originalEnvironments
    ]
  }, [environments, inputValue])

  const FormValue = z.object({
    environment: z.string().min(1)
  })
  const form = useForm<z.infer<typeof FormValue>>({
    resolver: zodResolver(FormValue)
  })

  const requestLinkEnvironment = async (
    url: string,
    { arg }: { arg: GroupValue }
  ) => {
    const resp = await fetch(url, {
      method: 'POST',
      body: JSON.stringify(arg)
    })
    if (!resp.ok) {
      throw new Error('Failed to link environment to group')
    }
  }
  const requestNewEnvironment = async (
    url: string,
    { arg }: { arg: NewEnvironmentRequest }
  ) => {
    const resp = await fetch(url, {
      method: 'POST',
      body: JSON.stringify(arg)
    })
    if (!resp.ok) {
      throw new Error('Failed to create new environment')
    }
  }

  const { trigger: newEnvironmentTrigger } = useSWRMutation(
    `/api/environments`,
    requestNewEnvironment
  )
  const { trigger: linkTrigger } = useSWRMutation(
    `/api/groups/${groupName}/link`,
    requestLinkEnvironment
  )
  const onSubmit = async (data: z.infer<typeof FormValue>) => {
    const isExistingEnvironment = environments.includes(data.environment)
    if (!isExistingEnvironment) {
      try {
        await newEnvironmentTrigger(
          { name: data.environment },
          {
            onSuccess: () => {
              toast({
                title: 'Request successful',
                description: `Environment ${data.environment} created successfully`
              })
            },
            onError: () => {
              toast({
                title: 'Request failed',
                description: `Failed to create environment ${data.environment}, please try again later.`,
                variant: 'destructive'
              })
            }
          }
        )
      } catch (error) {
        return
      }
    }

    const value: GroupValue = {
      environments: [...currentEnvironments, data.environment]
    }
    try {
      await linkTrigger(value, {
        onSuccess: () => {
          toast({
            title: 'Request successful',
            description: `Environment added to group ${groupName} successfully`
          })
        },
        onError: () => {
          toast({
            title: 'Request failed',
            description: `Failed to add environment to group ${groupName}, please try again later.`,
            variant: 'destructive'
          })
        }
      })
    } catch (error) {
      return
    }
  }

  if (isLoading) {
    return <div>Loading existing environments...</div>
  }
  if (error) {
    return <div>Failed to load existing environments</div>
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="environment"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Environment</FormLabel>
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={open}
                      className={cn(
                        'w-[400px] justify-between',
                        !field.value && 'text-muted-foreground'
                      )}
                    >
                      {field.value
                        ? environmentsAndInput.find(
                            (entry) => entry.environment === field.value
                          )?.environment ?? 'Select environment...'
                        : 'Select environment...'}
                      <ChevronUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-[400px] p-0">
                  <Command>
                    <CommandInput
                      placeholder="Search or create environment..."
                      onValueChange={(value) => {
                        setInputValue(value)
                      }}
                    />
                    <CommandList>
                      <CommandEmpty>No environment found.</CommandEmpty>
                      <CommandGroup>
                        {environmentsAndInput.map((entry) => (
                          <CommandItem
                            key={entry.environment}
                            value={entry.environment}
                            onSelect={(currentValue) => {
                              form.setValue(
                                'environment',
                                currentValue === field.value ? '' : currentValue
                              )
                              setOpen(false)
                            }}
                          >
                            <CheckIcon
                              className={cn(
                                'mr-2 h-4 w-4',
                                field.value === entry.environment
                                  ? 'opacity-100'
                                  : 'opacity-0'
                              )}
                            />
                            {entry.environment}
                            {entry.isNew && (
                              <span className="text-xs text-gray-800 ml-1">
                                {' '}
                                (new)
                              </span>
                            )}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </FormItem>
          )}
        />
        <Button type="submit">Submit</Button>
      </form>
    </Form>
  )
}
