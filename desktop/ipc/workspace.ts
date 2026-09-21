import { ipcMain } from 'electron'

import { createWorkspaceStore } from './workspace-store'

import { DesktopDraftInputSchema, DesktopRecentRunInputSchema } from '@/types'

export function registerWorkspaceIpc(filePath: string) {
  const store = createWorkspaceStore(filePath)

  ipcMain.handle('workspace:draft:list', async () => store.listDrafts())
  ipcMain.handle('workspace:draft:save', async (_event, payload: unknown) =>
    store.saveDraft(DesktopDraftInputSchema.parse(payload))
  )
  ipcMain.handle('workspace:recent:append', async (_event, payload: unknown) =>
    store.appendRecentRun(DesktopRecentRunInputSchema.parse(payload))
  )
  ipcMain.handle('workspace:recent:list', async () => store.listRecentRuns())
  ipcMain.handle('workspace:benchmark:list', async () => store.listBenchmarks())
}
