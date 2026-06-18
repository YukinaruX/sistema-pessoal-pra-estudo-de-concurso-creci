import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Avisa cedo (no console) se as variáveis não foram configuradas — evita
// telas em branco silenciosas e erros obscuros de rede.
export const supabaseConfigurado = Boolean(url && anonKey);

if (!supabaseConfigurado) {
  console.warn(
    '[Supabase] VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY ausentes. ' +
      'Copie .env.example para .env e preencha as credenciais.'
  );
}

// Cria o cliente mesmo sem credenciais para não quebrar o import; as chamadas
// é que vão falhar de forma controlada e a UI mostra o aviso de configuração.
export const supabase = createClient(
  url || 'http://localhost',
  anonKey || 'public-anon-key'
);
