import type { User } from '@prisma/client'

import { AppUserNotFoundError, UnauthorizedError } from '@/lib/auth/require-current-user'
import { prisma } from '@/lib/db/prisma'
import { createSupabasePublicClient } from '@/lib/supabase/public'

export async function resolveDesktopAppUser(accessToken: string): Promise<User> {
  if (!accessToken) {
    throw new UnauthorizedError()
  }

  const supabase = createSupabasePublicClient()
  const { data, error } = await supabase.auth.getUser(accessToken)

  if (error || !data.user) {
    throw new UnauthorizedError()
  }

  const dbUser = await prisma.user.findUnique({
    where: { supabaseId: data.user.id },
  })

  if (!dbUser) {
    throw new AppUserNotFoundError()
  }

  return dbUser
}
