import { ContextWithBindings } from '../common/bindings'
import { parseNewGroupRequest } from '../common/parse'
import { errorResponse, successResponse } from '../common/response'
import { getUnixTimestamp } from '../common/time'
import { GroupMetadata, GroupValue, NewGroupRequest } from '../common/types'

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
