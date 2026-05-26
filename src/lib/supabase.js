import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://txtuwicprzpndrphqcti.supabase.co'
const SUPABASE_ANON_KEY = 'sb_publishable_Eg4LO47kFPoPnJag9QPF5w_qs3_Uiht'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
