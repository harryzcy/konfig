import { parseEnvironmentValue, parseGroupValue, parseKey } from '@/src/parse'
import { getNthLastPathname } from '@/src/request'
import {
  errorResponse,
  notFoundResponse,
  successResponse
} from '@/src/response'
import type {
  Env,
  EnvironmentMetadata,
  EnvironmentValue,
  GroupMetadata,
  GroupValue,
  Key
} from '@/src/types'

export const runtime = 'edge'

// Link a group to environment(s)
export async function POST(req: Request) {
  // url is /api/groups/[name]/link
  console.log('Handling POST request')

  let groupName: Key
  let groupValue: GroupValue
  try {
    const rawName = getNthLastPathname(req.url, 1, 'group name')

    console.log('Received request for group name:', rawName)
    groupName = parseKey(rawName)

    groupValue = parseGroupValue(await req.text())
  } catch (e) {
    const error = e as Error
    return errorResponse(error)
  }

  const { CONFIG_KV } = process.env as unknown as Env
  const groupKey = `group:${groupName}`

  // get group
  console.log('Fetching key ' + groupKey + ' from KV')
  const { value: groupRaw, metadata: groupMetadata } =
    await CONFIG_KV.getWithMetadata<GroupMetadata>(groupKey)
  if (groupRaw === null) {
    console.log(`Key ${groupKey} not found in KV`)
    return notFoundResponse()
  }
  // ensure not deleted
  if (groupMetadata?.deleted && groupMetadata.deleted > 0) {
    console.log(`Key ${groupKey} is soft deleted`)
    return errorResponse(new Error(`Group ${groupName} is soft deleted`))
  }

  // get environments
  const environmentValues: Record<
    string,
    { value: EnvironmentValue; metadata: EnvironmentMetadata }
  > = {}
  for (const environmentName of groupValue.environments) {
    const environmentKey = `env:${environmentName}`
    console.log('Fetching key ' + environmentKey + ' from KV')
    const { value: environmentRaw, metadata: environmentMetadata } =
      await CONFIG_KV.getWithMetadata<EnvironmentMetadata>(environmentKey)
    if (environmentRaw === null || environmentMetadata === null) {
      console.log(`Key ${environmentKey} not found in KV`)
      return notFoundResponse(`Environment ${environmentName} is not found`)
    }
    // ensure not deleted
    if (environmentMetadata?.deleted && environmentMetadata.deleted > 0) {
      console.log(`Key ${environmentKey} is soft deleted`)
      return errorResponse(
        new Error(`Environment ${environmentName} is soft deleted`)
      )
    }
    const environmentValue = parseEnvironmentValue(environmentRaw)
    environmentValues[environmentName] = {
      value: environmentValue,
      metadata: environmentMetadata
    }
  }

  const previousGroupValue = parseGroupValue(groupRaw)

  console.log(`Updating key ${groupKey}`)
  const newGroupValue = {
    ...groupValue,
    environments: [
      ...new Set([
        ...previousGroupValue.environments,
        ...groupValue.environments
      ])
    ]
  } as GroupValue
  await CONFIG_KV.put(groupKey, JSON.stringify(newGroupValue), {
    metadata: groupMetadata
  })
  console.log(`Updated key ${groupKey}`)

  for (const environmentName of groupValue.environments) {
    const environmentKey = `env:${environmentName}`
    console.log(`Updating key ${environmentKey}`)
    const { value, metadata } = environmentValues[environmentName]
    const environmentValue = {
      ...value,
      groups: [...new Set([...value.groups, groupName])]
    } as EnvironmentValue
    await CONFIG_KV.put(environmentKey, JSON.stringify(environmentValue), {
      metadata
    })
    console.log(`Updated key ${environmentKey}`)
  }

  return successResponse()
}
