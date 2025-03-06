// @vitest-environment jsdom
import GroupNav from './GroupNav'
import '@testing-library/jest-dom'
import { render, screen, waitFor } from '@testing-library/react'
import user from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { afterAll, afterEach, beforeAll, describe, expect, test } from 'vitest'

const server = setupServer(
  http.get('/api/groups', () => {
    return HttpResponse.json({
      groups: ['group1', 'group2']
    })
  }),
  http.post('/api/groups', () => {
    return HttpResponse.text('ok')
  })
)

describe('GroupNav component', () => {
  beforeAll(() => {
    server.listen()
  })
  afterEach(() => server.resetHandlers())
  afterAll(() => server.close())

  test('should render group names', async () => {
    render(<GroupNav />)

    await waitFor(() => {
      expect(screen.queryByLabelText('loading')).toBeNull()
    })

    for (const group of ['group1', 'group2']) {
      expect(screen.getByText(group)).toBeInTheDocument()
    }
    expect(screen.queryByText('not-exist')).toBeNull()
  })

  test('add group - dismissed', async () => {
    render(<GroupNav />)

    const addGroupButton = screen.getByLabelText('add group')
    await user.click(addGroupButton)

    const input = screen.getByPlaceholderText('Type group name here')
    expect(input).toBeInTheDocument()
    expect(input.nodeName).toBe('INPUT')

    // outside click
    await user.click(document.body)
    expect(screen.queryByPlaceholderText('Type group name here')).toBeNull()
  })

  test('add group - succeed', async () => {
    render(<GroupNav />)

    const addGroupButton = screen.getByLabelText('add group')
    await user.click(addGroupButton)

    const input = screen.getByPlaceholderText('Type group name here')

    expect(input).toBeInTheDocument()
    await user.type(input, 'group3')

    // outside click
    await user.click(document.body)
    expect(screen.queryByPlaceholderText('Type group name here')).toBeNull()
  })
})
