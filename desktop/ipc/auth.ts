import type {
  SignInWithPasswordCredentials,
  SignUpWithPasswordCredentials,
} from '@supabase/supabase-js'
import { ipcMain } from 'electron'

import { loadDesktopSession, saveDesktopSession } from '../../lib/desktop/session-store'
import { createSupabasePublicClient } from '../../lib/supabase/public'

export function registerAuthIpc() {
  ipcMain.handle('auth:session:get', async () => loadDesktopSession())
  ipcMain.handle('auth:session:set', async (_event, payload: Record<string, unknown> = {}) => {
    await saveDesktopSession(payload)
  })
  ipcMain.handle('auth:login', async (_event, payload: SignInWithPasswordCredentials) => {
    const supabase = createSupabasePublicClient()
    const { data, error } = await supabase.auth.signInWithPassword(payload)

    if (error || !data.session) {
      throw error ?? new Error('Login failed')
    }

    await saveDesktopSession(data.session as unknown as Record<string, unknown>)
    return data.session
  })
  ipcMain.handle('auth:register', async (_event, payload: SignUpWithPasswordCredentials) => {
    const supabase = createSupabasePublicClient()
    const { data, error } = await supabase.auth.signUp(payload)

    if (error) {
      throw error
    }

    return data
  })
  ipcMain.handle('auth:logout', async () => {
    await saveDesktopSession({})
    return { ok: true }
  })
}
