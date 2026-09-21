import type { User } from '@prisma/client'

import { prisma } from '@/lib/db/prisma'
import { createSupabaseActionClient } from '@/lib/supabase/action'

export class UnauthorizedError extends Error {
  constructor(message = 'Unauthorized') {
    super(message)
    this.name = 'UnauthorizedError'
  }
}

export class AppUserNotFoundError extends Error {
  constructor(message = 'User not found') {
    super(message)
    this.name = 'AppUserNotFoundError'
  }
}

export async function requireCurrentAppUser(): Promise<User> {
  const supabase = await createSupabaseActionClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new UnauthorizedError()
  }

  const dbUser = await prisma.user.findUnique({
    where: { supabaseId: user.id },
  })

  if (!dbUser) {
    throw new AppUserNotFoundError()
  }

  return dbUser
}
