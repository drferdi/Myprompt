import { readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'

import { app } from 'electron'

const SESSION_PATH = path.join(app.getPath('userData'), 'session.json')

export async function saveDesktopSession(session: Record<string, unknown>) {
  await writeFile(SESSION_PATH, JSON.stringify(session, null, 2), 'utf8')
}

export async function loadDesktopSession(): Promise<Record<string, unknown> | null> {
  try {
    const raw = await readFile(SESSION_PATH, 'utf8')
    return JSON.parse(raw) as Record<string, unknown>
  } catch {
    return null
  }
}
