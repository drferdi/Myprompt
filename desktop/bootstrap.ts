import Module from 'node:module'
import path from 'node:path'

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

import './main'
