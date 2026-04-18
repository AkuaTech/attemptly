import { createClient } from '@supabase/supabase-js'

const url = 'https://zeyqnwibfnbtmnailpbf.supabase.co'
const key = 'sb_publishable_5hWDi1_eKrOcL4ho6XgBfQ_LSPsuee4'

export const supabase = createClient(url, key)
