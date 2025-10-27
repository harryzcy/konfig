import { ContextWithBindings } from '@/common/bindings'
import { TTL } from '@/common/constants'
import {
  parseEnvironmentValue,
  parseGroupValue,
  parseKey,
  parseNewGroupRequest
} from '@/common/parse'
import {
  errorResponse,
  notFoundResponse,
  successResponse
} from '@/common/response'
import { getUnixTimestamp } from '@/common/time'
import {
  EnvironmentMetadata,
  EnvironmentValue,
  Group,
  GroupMetadata,
  GroupValue,
  Key,
  NewGroupRequest
} from '@/common/types'

export const groupsGet = async (c: ContextWithBindings) => {
  console.log('Handling GET request for groups')

  const prefix = 'group:'
  console.log(`Getting key with prefix ${prefix} from KV`)
  const value = await c.env.CONFIG_KV.list<GroupMetadata>({
    prefix
  })
  console.log(`Got key with prefix ${prefix} from KV`)

  const groups = value.keys.map((key) => key.name.replace(prefix, ''))

  return c.json({ groups })
}

export const groupsPost = async (c: ContextWithBindings) => {
  console.log('Handling POST request for groups')

  let env: NewGroupRequest
  try {
    env = parseNewGroupRequest(await c.req.text())
  } catch (e) {
    const error = e as Error
    return errorResponse(c, error)
  }

  const key = `group:${env.name}`
  const value = {
    environments: []
  } as GroupValue
  const metadata = {
    created: getUnixTimestamp()
  } as GroupMetadata

  console.log(`Storing key ${key} in KV`)
  await c.env.CONFIG_KV.put(key, JSON.stringify(value), {
    metadata
  })
  console.log(`Stored key ${key} in KV`)

  return successResponse(c)
}

export const groupGet = async (c: ContextWithBindings) => {
  console.log('Handling GET request for a specific group')

  let name: Key
  try {
    const rawName = c.req.param('name')
    name = parseKey(rawName)
  } catch (e) {
    const error = e as Error
    return errorResponse(c, error)
  }

  const key = `group:${name}`

  console.log('Fetching key ' + name + ' from KV')
  const { value: raw, metadata } =
    await c.env.CONFIG_KV.getWithMetadata<GroupMetadata>(key)
  if (raw === null) {
    console.log(`Key ${key} not found in KV`)
    return notFoundResponse(c)
  }
  console.log(`Found key ${key} in KV`)

  const value = parseGroupValue(raw)
  const env = {
    name,
    metadata,
    ...value
  } as Group

  return c.json(env)
}

// Hard delete
export const groupHardDelete = async (c: ContextWithBindings) => {
  console.log('Handling DELETE request for a specific group')

  let name: Key
  try {
    const rawName = c.req.param('name')
    name = parseKey(rawName)
  } catch (e) {
    const error = e as Error
    return errorResponse(c, error)
  }

  const key = `group:${name}`

  // query key
  console.log('Fetching key ' + key + ' from KV')
  const { value: raw, metadata } =
    await c.env.CONFIG_KV.getWithMetadata<GroupMetadata>(key)

  // check if key exists
  if (raw === null) {
    console.log(`Key ${key} not found in KV`)
    return notFoundResponse(c)
  }

  // check if soft deleted
  if (metadata?.deleted === undefined) {
    console.log(`Key ${key} is not soft deleted`)
    return errorResponse(c, new Error(`Group ${name} is not soft deleted`))
  }

  // check TTL
  const now = getUnixTimestamp()
  if (metadata.deleted + TTL > now) {
    console.log(`Key ${key} is soft deleted within TTL`)
    return errorResponse(
      c,
      new Error(`Group ${name} is soft deleted within TTL`)
    )
  }

  // check if keys are emptied
  const resp = await c.env.CONFIG_KV.list({ prefix: `entry:${name}:` })
  if (resp.keys.length > 0) {
    console.log(`Key with prefix entry:${name}: still has keys`)
    return errorResponse(c, new Error(`Group ${name} still has keys`))
  }

  // hard delete
  console.log(`Deleting key ${key} from KV`)
  await c.env.CONFIG_KV.delete(key)
  console.log(`Deleted key ${key} from KV`)

  return successResponse(c)
}

// Soft delete
// url is /api/groups/[name]/delete
export const groupSoftDelete = async (c: ContextWithBindings) => {
  console.log('Handling DELETE (soft) request for a specific group')

  let name: Key
  try {
    const rawName = c.req.param('name')
    console.log('Received request for group name:', rawName)
    name = parseKey(rawName)
  } catch (e) {
    const error = e as Error
    return errorResponse(c, error)
  }

  const key = `group:${name}`

  // query key
  console.log('Fetching key ' + key + ' from KV')
  const { value: raw, metadata } =
    await c.env.CONFIG_KV.getWithMetadata<GroupMetadata>(key)
  if (raw === null) {
    console.log(`Key ${key} not found in KV`)
    return notFoundResponse(c)
  }
  if (metadata?.deleted !== undefined) {
    console.log(`Key ${key} is already soft deleted`)
    return errorResponse(c, new Error(`Group ${name} is already soft deleted`))
  }

  // check if keys are emptied
  const resp = await c.env.CONFIG_KV.list({ prefix: `entry:${name}:` })
  if (resp.keys.length > 0) {
    console.log(`Key with prefix entry:${name}: still has keys`)
    return errorResponse(c, new Error(`Group ${name} still has keys`))
  }

  console.log(`Marking key ${key} as soft deleted`)
  await c.env.CONFIG_KV.put(key, raw, {
    metadata: {
      ...metadata,
      deleted: getUnixTimestamp()
    }
  })
  console.log(`Marked key ${key} as soft deleted`)

  return successResponse(c)
}

// Link a group to environment(s).
// url is /api/groups/[name]/link
export const groupLink = async (c: ContextWithBindings) => {
  console.log('Handling POST request')

  let groupName: Key
  let groupValue: GroupValue
  try {
    const rawName = c.req.param('name')
    console.log('Received request for group name:', rawName)
    groupName = parseKey(rawName)
    groupValue = parseGroupValue(await c.req.text())
  } catch (e) {
    const error = e as Error
    return errorResponse(c, error)
  }

  const groupKey = `group:${groupName}`

  // get group
  console.log('Fetching key ' + groupKey + ' from KV')
  const { value: groupRaw, metadata: groupMetadata } =
    await c.env.CONFIG_KV.getWithMetadata<GroupMetadata>(groupKey)
  if (groupRaw === null) {
    console.log(`Key ${groupKey} not found in KV`)
    return notFoundResponse(c)
  }
  // ensure not deleted
  if (groupMetadata?.deleted && groupMetadata.deleted > 0) {
    console.log(`Key ${groupKey} is soft deleted`)
    return errorResponse(c, new Error(`Group ${groupName} is soft deleted`))
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
      await c.env.CONFIG_KV.getWithMetadata<EnvironmentMetadata>(environmentKey)
    if (environmentRaw === null || environmentMetadata === null) {
      console.log(`Key ${environmentKey} not found in KV`)
      return notFoundResponse(c, `Environment ${environmentName} is not found`)
    }
    // ensure not deleted
    if (environmentMetadata.deleted && environmentMetadata.deleted > 0) {
      console.log(`Key ${environmentKey} is deleted`)
      return errorResponse(
        c,
        new Error(`Environment ${environmentName} is deleted`)
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
  await c.env.CONFIG_KV.put(groupKey, JSON.stringify(newGroupValue), {
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
    await c.env.CONFIG_KV.put(
      environmentKey,
      JSON.stringify(environmentValue),
      {
        metadata
      }
    )
    console.log(`Updated key ${environmentKey}`)
  }

  return successResponse(c)
}
