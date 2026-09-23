import Module from 'node:module'
import path from 'node:path'

import { app } from 'electron'

type ResolveFilename = (
  request: string,
  parent: NodeJS.Module | null | undefined,
  isMain: boolean,
  options?: unknown
) => string

const moduleInternals = Module as typeof Module & {
  _resolveFilename: ResolveFilename
}

const originalResolveFilename = moduleInternals._resolveFilename
const distRoot = path.resolve(__dirname, '..')

moduleInternals._resolveFilename = function (
  request: string,
  parent: NodeJS.Module | null | undefined,
  isMain: boolean,
  options?: unknown
) {
  if (typeof request === 'string' && request.startsWith('@/')) {
    request = path.join(distRoot, request.slice(2))
  }

  return originalResolveFilename.call(this, request, parent, isMain, options)
}

// An explicit userData directory keeps automated runs (e2e) away from the developer's real
// window state, workspace store, and session file. It must be set before main.ts loads,
// because session-store resolves its file path at module load.
const userDataOverride = process.env.SENTRA_DESKTOP_USER_DATA?.trim()
if (userDataOverride) {
  app.setPath('userData', path.resolve(userDataOverride))
}

import './main'
