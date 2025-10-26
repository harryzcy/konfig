import { TTL } from '../src/common/constants'
import app from '../src/index'
import { env } from 'cloudflare:test'
import { describe, expect, test } from 'vitest'

describe('GET /api/groups', () => {
  const url = '/api/groups'

  test('empty', async () => {
    const res = await app.request(url, {}, env)
    expect(res).toHaveProperty('status', 200)
    expect(await res.json()).toEqual({ groups: [] })
  })

  test('non-empty', async () => {
    {
      const res = await app.request(
        url,
        { method: 'POST', body: '{"name":"project-1"}' },
        env
      )
      expect(res).toHaveProperty('status', 200)
    }
    const res = await app.request(url, {}, env)
    expect(res).toHaveProperty('status', 200)
    const result = await res.json()
    expect(result).toHaveProperty('groups')
    expect(result['groups']).toHaveLength(1)
    expect(result['groups']).toBeInstanceOf(Array)
    expect(result['groups']).toContain('project-1')
  })
})

describe('POST /api/groups', () => {
  const url = '/api/groups'
  test('success', async () => {
    const res = await app.request(
      url,
      {
        method: 'POST',
        body: '{"name":"project-1"}'
      },
      env
    )
    expect(res).toHaveProperty('status', 200)
    expect(await env.CONFIG_KV.get('group:project-1')).toBe(
      '{"environments":[]}'
    )
    await env.CONFIG_KV.delete('group:project-1')
  })

  test('invalid json', async () => {
    const res = await app.request(
      url,
      {
        method: 'POST',
        body: 'invalid input'
      },
      env
    )
    expect(res).toHaveProperty('status', 400)
    expect(await res.text()).toBe(
      '{"error":"invalid input: input is not valid JSON"}'
    )
    expect(
      await env.CONFIG_KV.list({
        prefix: 'group:'
      })
    ).toHaveProperty('keys', [])
  })

  test('zod validation failed', async () => {
    const res = await app.request(
      url,
      {
        method: 'POST',
        body: '{}'
      },
      env
    )
    expect(res).toHaveProperty('status', 400)
    const text = await res.text()
    console.log('text', text)
    expect(text).toBe('{"error":"invalid input: field name is invalid"}')
    expect(
      await env.CONFIG_KV.list({
        prefix: 'group:'
      })
    ).toHaveProperty('keys', [])
  })
})

describe('GET /api/groups/[name]', () => {
  test('empty environment', async () => {
    await env.CONFIG_KV.put('group:foo', JSON.stringify({ environments: [] }), {
      metadata: {
        created: 123
      }
    })

    const res = await app.request('/api/groups/foo', {}, env)
    expect(res).toHaveProperty('status', 200)
    expect(await res.text()).toBe(
      '{"name":"foo","metadata":{"created":123},"environments":[]}'
    )
    await env.CONFIG_KV.delete('group:foo')
  })

  test('non-empty environment', async () => {
    await env.CONFIG_KV.put(
      'group:bar',
      JSON.stringify({ environments: ['repo-1'] }),
      {
        metadata: {
          created: 123
        }
      }
    )

    const res = await app.request('/api/groups/bar', {}, env)
    expect(res).toHaveProperty('status', 200)
    expect(await res.text()).toBe(
      '{"name":"bar","metadata":{"created":123},"environments":["repo-1"]}'
    )
    await env.CONFIG_KV.delete('group:bar')
  })

  test('404 not found', async () => {
    const res = await app.request('/api/groups/does-not-exist', {}, env)
    expect(res).toHaveProperty('status', 404)
  })

  test('invalid name', async () => {
    const res = await app.request('/api/groups/invalid:key', {}, env)
    expect(res).toHaveProperty('status', 400)
    expect(await res.text()).toContain(
      '{"error":"invalid input: key cannot contain \\":\\""}'
    )
  })
})

describe('DELETE /api/groups/[name]', () => {
  test('success', async () => {
    await env.CONFIG_KV.put('group:foo', JSON.stringify({ environments: [] }), {
      metadata: {
        created: 123,
        deleted: Math.floor(Date.now() / 1000 - TTL - 1)
      }
    })
    const res = await app.request('/api/groups/foo', { method: 'DELETE' }, env)
    expect(res.status).toBe(200)
    expect(await res.text()).toBe('{"message":"success"}')
    await expect(env.CONFIG_KV.get('group:foo')).resolves.toBe(null)

    // Deleting again should give 404
    const resAgain = await app.request(
      '/api/groups/foo',
      { method: 'DELETE' },
      env
    )
    expect(resAgain).toHaveProperty('status', 404)
  })

  test('not soft deleted', async () => {
    await env.CONFIG_KV.put('group:foo', JSON.stringify({ environments: [] }), {
      metadata: {
        created: 123
      }
    })
    const res = await app.request('/api/groups/foo', { method: 'DELETE' }, env)
    expect(res).toHaveProperty('status', 400)
    expect(await res.text()).toBe('{"error":"Group foo is not soft deleted"}')
    await expect(env.CONFIG_KV.get('group:foo')).resolves.toBe(
      '{"environments":[]}'
    )
    await env.CONFIG_KV.delete('group:foo')
  })

  test('soft deleted within TTL', async () => {
    await env.CONFIG_KV.put(
      'group:foo',
      JSON.stringify({ environments: ['production'] }),
      {
        metadata: {
          created: 123,
          deleted: Math.floor(Date.now() / 1000)
        }
      }
    )
    const res = await app.request('/api/groups/foo', { method: 'DELETE' }, env)
    expect(res).toHaveProperty('status', 400)
    expect(await res.text()).toBe(
      '{"error":"Group foo is soft deleted within TTL"}'
    )
    await expect(env.CONFIG_KV.get('group:foo')).resolves.toBe(
      '{"environments":["production"]}'
    )
    await env.CONFIG_KV.delete('group:foo')
  })

  test('has keys', async () => {
    await env.CONFIG_KV.put(
      'group:foo',
      JSON.stringify({ environments: ['production'] }),
      {
        metadata: {
          created: 123,
          deleted: Math.floor(Date.now() / 1000 - TTL - 1)
        }
      }
    )
    await env.CONFIG_KV.put('entry:foo:production:bar', 'baz')

    const res = await app.request('/api/groups/foo', { method: 'DELETE' }, env)
    expect(res.status).toBe(400)
    expect(await res.text()).toBe('{"error":"Group foo still has keys"}')
    await expect(env.CONFIG_KV.get('group:foo')).resolves.toBe(
      '{"environments":["production"]}'
    )
    await env.CONFIG_KV.delete('group:foo')
  })

  test('invalid name', async () => {
    const res = await app.request(
      '/api/groups/invalid:key',
      { method: 'DELETE' },
      env
    )
    expect(res).toHaveProperty('status', 400)
    expect(await res.text()).toBe(
      '{"error":"invalid input: key cannot contain \\":\\""}'
    )
  })
})

describe('POST /api/groups/[name]/delete', () => {
  const url = '/api/groups/foo/delete'

  test('success', async () => {
    await env.CONFIG_KV.put('group:foo', JSON.stringify({ environments: [] }), {
      metadata: {
        created: 123
      }
    })

    const res = await app.request(url, { method: 'POST' }, env)
    expect(res.status).toBe(200)
    expect(await res.text()).toBe('{"message":"success"}')
    expect(await env.CONFIG_KV.get('group:foo')).toBe('{"environments":[]}')
    expect(await env.CONFIG_KV.getWithMetadata('group:foo')).toHaveProperty(
      'metadata.deleted'
    )

    // Deleting again should give 400, already soft deleted
    const resAgain = await app.request(url, { method: 'POST' }, env)
    expect(resAgain).toHaveProperty('status', 400)
    expect(await resAgain.text()).toBe(
      '{"error":"Group foo is already soft deleted"}'
    )
  })

  test('has keys', async () => {
    await env.CONFIG_KV.put(
      'group:foo',
      JSON.stringify({ environments: ['staging'] }),
      {
        metadata: {
          created: 123
        }
      }
    )
    await env.CONFIG_KV.put('entry:foo:staging:bar', 'baz')

    const res = await app.request(url, { method: 'POST' }, env)
    expect(res).toHaveProperty('status', 400)
    expect(await res.text()).toBe('{"error":"Group foo still has keys"}')
    expect(await env.CONFIG_KV.get('group:foo')).toBe(
      '{"environments":["staging"]}'
    )
    expect(await env.CONFIG_KV.get('entry:foo:staging:bar')).toBe('baz')
  })

  test('has multiple keys', async () => {
    await env.CONFIG_KV.put(
      'group:foo',
      JSON.stringify({ environments: ['production', 'staging', 'demo'] }),
      {
        metadata: {
          created: 123
        }
      }
    )
    await env.CONFIG_KV.put('entry:foo:staging:bar', 'baz')
    await env.CONFIG_KV.put('entry:foo:production:bar', 'baz')

    const res = await app.request(url, { method: 'POST' }, env)
    expect(res).toHaveProperty('status', 400)
    expect(await res.text()).toBe('{"error":"Group foo still has keys"}')
    expect(await env.CONFIG_KV.get('group:foo')).toBe(
      '{"environments":["production","staging","demo"]}'
    )
  })

  test('404 not found', async () => {
    const res = await app.request(
      '/api/groups/not-found/delete',
      { method: 'POST' },
      env
    )
    expect(res).toHaveProperty('status', 404)
    expect(await res.text()).toBe('{"error":"not found"}')
  })
})

describe('POST /api/groups/[name]/link', () => {
  const url = '/api/groups/foo/link'

  const defaultMetadata = {
    created: 123
  }

  test('success', async () => {
    await env.CONFIG_KV.put('env:production', '{"groups":[]}', {
      metadata: defaultMetadata
    })
    await env.CONFIG_KV.put('group:foo', '{"environments":[]}', {
      metadata: defaultMetadata
    })

    const body = JSON.stringify({ environments: ['production'] })
    const res = await app.request(url, { method: 'POST', body }, env)
    expect(res.status).toBe(200)
    expect(await res.text()).toBe('{"message":"success"}')

    const { value: group, metadata: groupMetadata } =
      await env.CONFIG_KV.getWithMetadata('group:foo')
    expect(group).toBe('{"environments":["production"]}')
    expect(groupMetadata).toStrictEqual(defaultMetadata)

    const { value: environment, metadata: envMetadata } =
      await env.CONFIG_KV.getWithMetadata('env:production')
    expect(environment).toBe('{"groups":["foo"]}')
    expect(envMetadata).toStrictEqual(defaultMetadata)

    // linking again should be a no-op
    const resAgain = await app.request(url, { method: 'POST', body }, env)
    expect(resAgain.status).toBe(200)
    const { value: groupAgain, metadata: groupMetadataAgain } =
      await env.CONFIG_KV.getWithMetadata('group:foo')
    expect(groupAgain).toBe('{"environments":["production"]}')
    expect(groupMetadataAgain).toStrictEqual(defaultMetadata)

    const { value: envAgain, metadata: envMetadataAgain } =
      await env.CONFIG_KV.getWithMetadata('env:production')
    expect(envAgain).toBe('{"groups":["foo"]}')
    expect(envMetadataAgain).toStrictEqual(defaultMetadata)

    // cleanup
    await env.CONFIG_KV.delete('env:production')
    await env.CONFIG_KV.delete('group:foo')
  })

  test('success with multiple environments', async () => {
    await env.CONFIG_KV.put('env:production', JSON.stringify({ groups: [] }), {
      metadata: defaultMetadata
    })
    await env.CONFIG_KV.put('env:staging', JSON.stringify({ groups: [] }), {
      metadata: defaultMetadata
    })
    await env.CONFIG_KV.put('group:foo', JSON.stringify({ environments: [] }), {
      metadata: defaultMetadata
    })

    const body = JSON.stringify({ environments: ['production', 'staging'] })
    const res = await app.request(url, { method: 'POST', body }, env)
    expect(res.status).toBe(200)
    expect(await res.text()).toBe('{"message":"success"}')

    const { value: group, metadata: groupMetadata } =
      await env.CONFIG_KV.getWithMetadata('group:foo')
    expect(group).toBe('{"environments":["production","staging"]}')
    expect(groupMetadata).toStrictEqual(defaultMetadata)

    const { value: environment, metadata: envMetadata } =
      await env.CONFIG_KV.getWithMetadata('env:production')
    expect(environment).toBe('{"groups":["foo"]}')
    expect(envMetadata).toStrictEqual(defaultMetadata)

    const { value: env2, metadata: envMetadata2 } =
      await env.CONFIG_KV.getWithMetadata('env:staging')
    expect(env2).toBe('{"groups":["foo"]}')
    expect(envMetadata2).toStrictEqual(defaultMetadata)

    // cleanup
    await env.CONFIG_KV.delete('env:production')
    await env.CONFIG_KV.delete('env:staging')
    await env.CONFIG_KV.delete('group:foo')
  })

  test('one of the environment is marked as deleted', async () => {
    await env.CONFIG_KV.put('env:production', '{"groups":[]}', {
      metadata: defaultMetadata
    })
    await env.CONFIG_KV.put('env:demo', '{"groups":[]}', {
      metadata: defaultMetadata
    })
    await env.CONFIG_KV.put('env:staging', '{"groups":[]}', {
      metadata: {
        ...defaultMetadata,
        deleted: Math.floor(Date.now() / 1000)
      }
    })
    await env.CONFIG_KV.put('group:foo', '{"environments":["demo"]}', {
      metadata: defaultMetadata
    })

    const body = JSON.stringify({ environments: ['production', 'staging'] })
    const res = await app.request(url, { method: 'POST', body }, env)
    expect(res.status).toBe(400)
    expect(await res.text()).toBe('{"error":"Environment staging is deleted"}')

    // values not changed
    const { value: group, metadata: groupMetadata } =
      await env.CONFIG_KV.getWithMetadata('group:foo')
    expect(group).toBe('{"environments":["demo"]}')
    expect(groupMetadata).toStrictEqual(defaultMetadata)

    expect(await env.CONFIG_KV.get('env:production')).toBe('{"groups":[]}')
    expect(await env.CONFIG_KV.get('env:staging')).toBe('{"groups":[]}')

    // cleanup
    await env.CONFIG_KV.delete('env:production')
    await env.CONFIG_KV.delete('env:demo')
    await env.CONFIG_KV.delete('env:staging')
    await env.CONFIG_KV.delete('group:foo')
  })

  test('one of the environment does not exist', async () => {
    await env.CONFIG_KV.put('env:production', '{"groups":[]}', {
      metadata: defaultMetadata
    })
    await env.CONFIG_KV.put('group:foo', '{"environments":[]}', {
      metadata: defaultMetadata
    })

    const body = JSON.stringify({ environments: ['production', 'staging'] })
    const res = await app.request(url, { method: 'POST', body }, env)
    expect(res.status).toBe(404)
    expect(await res.text()).toBe(
      '{"error":"Environment staging is not found"}'
    )

    // values not changed
    const { value: group, metadata: groupMetadata } =
      await env.CONFIG_KV.getWithMetadata('group:foo')
    expect(group).toBe('{"environments":[]}')
    expect(groupMetadata).toStrictEqual(defaultMetadata)

    expect(await env.CONFIG_KV.get('env:production')).toBe('{"groups":[]}')

    // cleanup
    await env.CONFIG_KV.delete('env:production')
    await env.CONFIG_KV.delete('group:foo')
  })

  test('group key is already soft deleted', async () => {
    const deletedTime = Math.floor(Date.now() / 1000)
    await env.CONFIG_KV.put('env:production', '{"groups":[]}', {
      metadata: defaultMetadata
    })
    await env.CONFIG_KV.put('group:foo', '{"environments":[]}', {
      metadata: {
        ...defaultMetadata,
        deleted: deletedTime
      }
    })

    const body = JSON.stringify({ environments: ['production'] })
    const res = await app.request(url, { method: 'POST', body }, env)
    expect(res.status).toBe(400)
    expect(await res.text()).toBe('{"error":"Group foo is soft deleted"}')

    // values not changed
    const { value: group, metadata: groupMetadata } =
      await env.CONFIG_KV.getWithMetadata('group:foo')
    expect(group).toBe('{"environments":[]}')
    expect(groupMetadata).toStrictEqual({
      ...defaultMetadata,
      deleted: deletedTime
    })

    expect(await env.CONFIG_KV.get('env:production')).toBe('{"groups":[]}')

    // cleanup
    await env.CONFIG_KV.delete('env:production')
    await env.CONFIG_KV.delete('group:foo')
  })

  test('404 not found', async () => {
    const body = JSON.stringify({ environments: ['production'] })
    const res = await app.request(
      '/api/groups/not-found/link',
      { method: 'POST', body },
      env
    )
    expect(res).toHaveProperty('status', 404)
    expect(await res.text()).toBe('{"error":"not found"}')
  })
})
