import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import type { Database } from '@/types/database'

// Use this in Server Components and Route Handlers
export const createServerClient = () =>
  createServerComponentClient<Database>({ cookies })
