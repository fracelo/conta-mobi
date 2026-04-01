import * as SQLite from 'expo-sqlite';
import { supabase } from '../services/supabase';

const db = SQLite.openDatabaseSync('contamobi.db');

export const sincronizarDados = async () => {
  // 1. Busca todos os logs pendentes (em ordem cronológica)
  const logs = db.getAllSync(
    'SELECT * FROM logsenviar WHERE status = "pendente" ORDER BY criado_em ASC'
  ) as any[];

  if (logs.length === 0) return;

  console.log(`Iniciando sincronismo de ${logs.length} registros...`);

  for (const log of logs) {
    try {
      const payload = JSON.parse(log.payload);

      // 2. Tenta enviar para o Supabase usando UPSERT (Insere ou Atualiza)
      const { error } = await supabase
        .from(log.tabela)
        .upsert(payload);

      if (!error) {
        // 3. Se deu sucesso, marca como 'enviado' no SQLite
        db.runSync(
          'UPDATE logsenviar SET status = "enviado" WHERE logsenviaruuid = ?',
          [log.logsenviaruuid]
        );
        console.log(`✓ Sincronizado: ${log.tabela} (${log.logsenviaruuid})`);
      } else {
        console.error(`✗ Erro no Supabase (${log.tabela}):`, error.message);
      }
    } catch (err) {
      console.error("Erro ao processar log:", err);
    }
  }
};