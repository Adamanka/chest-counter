import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { DataPanel } from './DataPanel'
import { useAppStore } from '@/store/appStore'

/**
 * Regression test: DataPanel used to call `useAppStore(selectPersistedData)`,
 * a selector that builds a new object on every call. In Zustand v5 that makes
 * React warn "The result of getSnapshot should be cached" and then throw
 * "Maximum update depth exceeded", which replaced the whole settings screen
 * with the error boundary.
 */
describe('DataPanel', () => {
  beforeEach(() => {
    useAppStore.setState({
      events: [],
      matches: [],
      customTypes: [],
      goals: [],
    })
  })

  it('renders the data card without an update loop', () => {
    render(<DataPanel />)

    expect(screen.getByText('Данные')).toBeInTheDocument()
    expect(screen.getByTestId('export-json')).toBeInTheDocument()
    expect(screen.getByTestId('reset-open')).toBeInTheDocument()
  })
})
