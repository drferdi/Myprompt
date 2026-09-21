import { contextBridge, ipcRenderer } from 'electron'

const streamListenerMap = new Map<
  string,
  Map<(payload: unknown) => void, (...args: unknown[]) => void>
>()

function getChannelListenerMap(channel: string) {
  let listeners = streamListenerMap.get(channel)

  if (!listeners) {
    listeners = new Map()
    streamListenerMap.set(channel, listeners)
  }

  return listeners
}

contextBridge.exposeInMainWorld('sentraDesktop', {
  getShellState: () => ipcRenderer.invoke('app:get-shell-state'),
  auth: {
    getSession: () => ipcRenderer.invoke('auth:session:get'),
    setSession: (payload: Record<string, unknown>) =>
      ipcRenderer.invoke('auth:session:set', payload),
    login: (payload: Record<string, unknown>) => ipcRenderer.invoke('auth:login', payload),
    register: (payload: Record<string, unknown>) => ipcRenderer.invoke('auth:register', payload),
    logout: () => ipcRenderer.invoke('auth:logout'),
  },
  workspace: {
    listDrafts: () => ipcRenderer.invoke('workspace:draft:list'),
    saveDraft: (payload: Record<string, unknown>) =>
      ipcRenderer.invoke('workspace:draft:save', payload),
    listRecentRuns: () => ipcRenderer.invoke('workspace:recent:list'),
    listBenchmarks: () => ipcRenderer.invoke('workspace:benchmark:list'),
  },
  onStream: (channel: string, callback: (payload: unknown) => void) => {
    const listeners = getChannelListenerMap(channel)
    const wrapped = (_event: unknown, payload: unknown) => callback(payload)

    listeners.set(callback, wrapped)
    ipcRenderer.on(channel, wrapped)
  },
  offStream: (channel: string, callback: (payload: unknown) => void) => {
    const listeners = streamListenerMap.get(channel)
    const wrapped = listeners?.get(callback)

    if (!wrapped) {
      return
    }

    ipcRenderer.removeListener(channel, wrapped)
    listeners?.delete(callback)

    if (listeners && listeners.size === 0) {
      streamListenerMap.delete(channel)
    }
  },
  invoke: (channel: string, payload?: unknown) =>
    ipcRenderer.invoke(channel, payload) as Promise<unknown>,
  close: () => ipcRenderer.send('window:close'),
  minimize: () => ipcRenderer.send('window:minimize'),
  getWindowPos: () => ipcRenderer.invoke('window:get-pos'),
  setWindowPos: (x: number, y: number) => ipcRenderer.send('window:set-pos', { x, y }),
})
