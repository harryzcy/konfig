// @vitest-environment jsdom
import GroupNav from './GroupNav'
import '@testing-library/jest-dom'
import { render, screen, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { afterAll, afterEach, beforeAll, describe, expect, test } from 'vitest'

const server = setupServer(
  http.get('/api/groups', () => {
    return HttpResponse.json({
      groups: ['group1', 'group2']
    })
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
  })
})
