import 'react-native-url-polyfill/auto';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '@env'; // Importação das variáveis
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

// Verificação de segurança (opcional, mas ajuda no debug)
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error("Erro: Variáveis de ambiente do Supabase não carregadas!");
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});