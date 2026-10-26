import { createClient } from '@supabase/supabase-js'
import type { Database } from './database.types'

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!url || !anonKey) {
  // Falha cedo e com mensagem clara, em vez de erros estranhos depois.
  throw new Error('Faltam VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no .env.local')
}

// O tipo <Database> faz o TypeScript conhecer cada tabela e coluna:
// errar o nome de um campo vira erro de compilação, não bug em produção.
//
// flowType 'pkce': o login com Google volta com ?code=... (antes do #), em vez de
// colocar o token no #. Como o app usa rotas com # (#/sala/...), o fluxo padrão se perderia.
export const supabase = createClient<Database>(url, anonKey, {
  auth: { flowType: 'pkce', detectSessionInUrl: true, persistSession: true },
})
