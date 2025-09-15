import { createClient } from '@supabase/supabase-js'

// Pega as variáveis de ambiente de forma segura do arquivo .env
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Cria e exporta a ÚNICA instância do cliente Supabase para ser usada em todo o app
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

