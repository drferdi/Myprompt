import { existsSync } from 'node:fs'
import { mkdir, readFile, rename, rm, writeFile } from 'node:fs/promises'
import { dirname } from 'node:path'

import {
  DesktopBenchmarkCaseInputSchema,
  DesktopBenchmarkCaseSchema,
  DesktopDraftInputSchema,
  DesktopDraftRecordSchema,
  DesktopRecentRunInputSchema,
  DesktopRecentRunSchema,
  DesktopWorkspaceSnapshotSchema,
  type DesktopBenchmarkCase,
  type DesktopBenchmarkCaseInput,
  type DesktopDraftInput,
  type DesktopDraftRecord,
  type DesktopRecentRun,
  type DesktopRecentRunInput,
  type DesktopWorkspaceSnapshot,
} from '@/types'

function createEmptySnapshot(): DesktopWorkspaceSnapshot {
  return {
    drafts: [],
    recentRuns: [],
    benchmarks: [],
  }
}

function upsertById<T extends { id: string }>(items: T[], nextItem: T) {
  return [nextItem, ...items.filter((item) => item.id !== nextItem.id)]
}

export function createWorkspaceStore(filePath: string) {
  let mutationChain = Promise.resolve()

  function buildTempFilePath() {
    return `${filePath}.${process.pid}.${Date.now()}.${Math.random().toString(16).slice(2)}.tmp`
  }

  function serializeMutation<T>(operation: () => Promise<T>) {
    const result = mutationChain.then(operation, operation)
    mutationChain = result.then(
      () => undefined,
      () => undefined
    )

    return result
  }

  async function readSnapshotSafe(): Promise<DesktopWorkspaceSnapshot> {
    if (!existsSync(filePath)) {
      return createEmptySnapshot()
    }

    try {
      const raw = await readFile(filePath, 'utf8')
      return DesktopWorkspaceSnapshotSchema.parse(JSON.parse(raw))
    } catch {
      return createEmptySnapshot()
    }
  }

  async function writeSnapshotAtomic(snapshot: DesktopWorkspaceSnapshot) {
    const normalized = DesktopWorkspaceSnapshotSchema.parse(snapshot)
    const tempFilePath = buildTempFilePath()

    await mkdir(dirname(filePath), { recursive: true })
    try {
      await writeFile(tempFilePath, JSON.stringify(normalized, null, 2), 'utf8')
      await rename(tempFilePath, filePath)
    } catch (error) {
      await rm(tempFilePath, { force: true }).catch(() => undefined)
      throw error
    }
  }

  async function read(): Promise<DesktopWorkspaceSnapshot> {
    await mutationChain
    return readSnapshotSafe()
  }

  async function write(snapshot: DesktopWorkspaceSnapshot) {
    return serializeMutation(async () => {
      await writeSnapshotAtomic(snapshot)
    })
  }

  async function saveDraft(input: DesktopDraftInput): Promise<DesktopDraftRecord> {
    return serializeMutation(async () => {
      const parsed = DesktopDraftInputSchema.parse(input)
      const snapshot = await readSnapshotSafe()
      const existing = snapshot.drafts.find((item) => item.id === parsed.id)
      const timestamp = new Date().toISOString()
      const record = DesktopDraftRecordSchema.parse({
        ...parsed,
        createdAt: existing?.createdAt ?? timestamp,
        updatedAt: timestamp,
      })

      await writeSnapshotAtomic({
        ...snapshot,
        drafts: upsertById(snapshot.drafts, record),
      })

      return record
    })
  }

  async function listDrafts() {
    return (await read()).drafts
  }

  async function appendRecentRun(input: DesktopRecentRunInput): Promise<DesktopRecentRun> {
    return serializeMutation(async () => {
      const parsed = DesktopRecentRunInputSchema.parse(input)
      const snapshot = await readSnapshotSafe()
      const record = DesktopRecentRunSchema.parse({
        ...parsed,
        createdAt: new Date().toISOString(),
      })

      await writeSnapshotAtomic({
        ...snapshot,
        recentRuns: upsertById(snapshot.recentRuns, record),
      })

      return record
    })
  }

  async function listRecentRuns() {
    return (await read()).recentRuns
  }

  async function saveBenchmarkCase(
    input: DesktopBenchmarkCaseInput
  ): Promise<DesktopBenchmarkCase> {
    return serializeMutation(async () => {
      const parsed = DesktopBenchmarkCaseInputSchema.parse(input)
      const snapshot = await readSnapshotSafe()
      const existing = snapshot.benchmarks.find((item) => item.id === parsed.id)
      const timestamp = new Date().toISOString()
      const record = DesktopBenchmarkCaseSchema.parse({
        ...parsed,
        createdAt: existing?.createdAt ?? timestamp,
        updatedAt: timestamp,
      })

      await writeSnapshotAtomic({
        ...snapshot,
        benchmarks: upsertById(snapshot.benchmarks, record),
      })

      return record
    })
  }

  async function listBenchmarks() {
    return (await read()).benchmarks
  }

  return {
    read,
    write,
    saveDraft,
    listDrafts,
    appendRecentRun,
    listRecentRuns,
    saveBenchmarkCase,
    listBenchmarks,
  }
}
