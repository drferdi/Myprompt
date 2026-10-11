import { mkdtemp, readFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

import {
  createWorkspaceStore,
  getWorkspaceStore,
} from '../../desktop/ipc/workspace-store'

describe('workspace store', () => {
  it('returns one shared instance per file path', () => {
    const filePath = '/tmp/myprompt-shared-workspace.json'
    expect(getWorkspaceStore(filePath)).toBe(getWorkspaceStore(filePath))
  })

  it('preserves concurrent writes when handlers share getWorkspaceStore', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'myprompt-ws-'))
    const filePath = join(dir, 'workspace.json')

    try {
      const storeA = getWorkspaceStore(filePath)
      const storeB = getWorkspaceStore(filePath)

      await Promise.all([
        storeA.appendRecentRun({
          id: 'run-a',
          sourceMode: 'optimize',
          rawInput: 'first',
          outputText: 'first',
        }),
        storeB.appendRecentRun({
          id: 'run-b',
          sourceMode: 'optimize',
          rawInput: 'second',
          outputText: 'second',
        }),
      ])

      const snapshot = JSON.parse(await readFile(filePath, 'utf8'))
      expect(snapshot.recentRuns.map((run: { id: string }) => run.id).sort()).toEqual([
        'run-a',
        'run-b',
      ])
    } finally {
      await rm(dir, { recursive: true, force: true })
    }
  })

  it('separate createWorkspaceStore instances can drop concurrent writes', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'myprompt-ws-'))
    const filePath = join(dir, 'workspace.json')

    try {
      const storeA = createWorkspaceStore(filePath)
      const storeB = createWorkspaceStore(filePath)

      await Promise.all([
        storeA.appendRecentRun({
          id: 'run-a',
          sourceMode: 'optimize',
          rawInput: 'first',
          outputText: 'first',
        }),
        storeB.appendRecentRun({
          id: 'run-b',
          sourceMode: 'optimize',
          rawInput: 'second',
          outputText: 'second',
        }),
      ])

      const snapshot = JSON.parse(await readFile(filePath, 'utf8'))
      expect(snapshot.recentRuns).toHaveLength(1)
    } finally {
      await rm(dir, { recursive: true, force: true })
    }
  })
})
