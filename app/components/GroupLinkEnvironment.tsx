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
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/24/outline'
import { useMemo, useState } from 'react'
import useSWR from 'swr'

interface GroupLinkEnvironmentProps {
  groupName: string
  currentEnvironments: string[]
}

export default function GroupLinkEnvironment(props: GroupLinkEnvironmentProps) {
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
  const [value, setValue] = useState('')

  const [inputValue, setInputValue] = useState('')
  const environmentsAndInput = useMemo(() => {
    if (!inputValue) {
      return environments
    }

    if (environments.includes(inputValue)) {
      return environments
    }

    return [inputValue, ...environments]
  }, [environments, inputValue])

  if (isLoading) {
    return <div>Loading existing environments...</div>
  }

  if (error) {
    return <div>Failed to load existing environments</div>
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[400px] justify-between"
        >
          {value
            ? environmentsAndInput.find(
                (environment) => environment === value
              ) ?? 'Select environment...'
            : 'Select environment...'}
          <ChevronUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0">
        <Command>
          <CommandInput
            placeholder="Search environment..."
            onValueChange={(value) => {
              setInputValue(value)
            }}
          />
          <CommandList>
            <CommandEmpty>No environment found.</CommandEmpty>
            <CommandGroup>
              {environmentsAndInput.map((env) => (
                <CommandItem
                  key={env}
                  value={env}
                  onSelect={(currentValue) => {
                    setValue(currentValue === value ? '' : currentValue)
                    setOpen(false)
                  }}
                >
                  <CheckIcon
                    className={cn(
                      'mr-2 h-4 w-4',
                      value === env ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                  {env}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
