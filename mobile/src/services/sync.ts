import * as SQLite from 'expo-sqlite';
import { supabase } from '../services/supabase';
import { usuarioAtual } from './auth';

const db = SQLite.openDatabaseSync('contamobi.db');

/**
 * Tabelas que serão sincronizadas. 
 * IMPORTANTE: A ordem importa para evitar erros de Foreign Key (ex: usuários antes de categorias).
 */
const TABELAS_SYNC = ['usuarios', 'planos', 'categorias'];

export const sincronizarDados = async () => {
  const user = await usuarioAtual();
  if (!user) {
    console.warn('[Sync] Usuário não identificado. Sincronismo abortado.');
    return;
  }

  console.log('--- [Sync] Iniciando Processo Sincronizado ---');

  // ==========================================
  // 1. PARTE: ENVIAR (Upload - Local para Nuvem)
  // ==========================================
  const logsPendentes = db.getAllSync(
    'SELECT * FROM logsenviar WHERE status = "pendente" ORDER BY ordem ASC'
  ) as any[];

  if (logsPendentes.length > 0) {
    console.log(`[Sync] Enviando ${logsPendentes.length} alterações para o Supabase...`);
    
    for (const log of logsPendentes) {
      try {
        const payload = JSON.parse(log.payload);
        
        // .upsert() resolve tanto INSERT quanto UPDATE no Supabase
        const { error } = await supabase.from(log.tabela).upsert(payload);

        if (!error) {
          db.runSync(
            'UPDATE logsenviar SET status = "enviado", atualizado_em = datetime("now") WHERE logsenviaruuid = ?',
            [log.logsenviaruuid]
          );
        } else {
          console.error(`[Sync] Erro no Supabase (${log.tabela}):`, error.message);
        }
      } catch (err) {
        console.error("[Sync] Falha ao processar payload do log:", err);
      }
    }
  }

  // ==========================================
  // 2. PARTE: RECEBER (Download - Nuvem para Local)
  // ==========================================
  
  // Busca a última data que o celular "baixou" algo
  const controle = db.getFirstSync(
    'SELECT ultima_sync_recebimento FROM sync_controle WHERE usuariouuid = ?',
    [user.id]
  ) as any;

  // Se não houver data, usamos uma data base bem antiga para baixar tudo
  const ultimaDataSync = controle?.ultima_sync_recebimento || '2000-01-01T00:00:00.000Z';

  for (const tabela of TABELAS_SYNC) {
    try {
      // 1. Consulta o Supabase buscando novidades
      let query = supabase.from(tabela).select('*');
      
      if (tabela !== 'planos') {
        query = query.eq('usuariouuid', user.id);
      }

      // Filtra por registros atualizados após o nosso último sync
      const { data: novidades, error } = await query.gt('updated_at', ultimaDataSync);

      if (error) throw error;

      if (novidades && novidades.length > 0) {
        console.log(`[Sync] Recebidas ${novidades.length} atualizações para a tabela: ${tabela}`);

        // 2. Gravação em Lote (BULK) com Transação para Performance
        db.withTransactionSync(() => {
          for (const item of novidades) {
            const colunas = Object.keys(item).join(', ');
            const placeholders = Object.keys(item).map(() => '?').join(', ');
            
            // 3. MAPEAMENTO DE TIPOS (Postgres -> SQLite)
            const valoresTratados = Object.values(item).map(valor => {
              // Null/Undefined
              if (valor === null || valor === undefined) return null;
              
              // Booleans (Postgres true/false -> SQLite 1/0)
              if (typeof valor === 'boolean') return valor ? 1 : 0;
              
              // JSONB / Objetos (Devem entrar no SQLite como String JSON)
              if (typeof valor === 'object' && !(valor instanceof Date)) {
                return JSON.stringify(valor);
              }
              
              // O resto (strings, numbers, dates em string ISO) passa direto
              return valor;
            }) as any[];

            db.runSync(
              `INSERT OR REPLACE INTO ${tabela} (${colunas}) VALUES (${placeholders})`,
              ...valoresTratados
            );
          }
        });
      }
    } catch (err: any) {
      console.error(`[Sync] Falha ao processar tabela ${tabela}:`, err.message);
    }
  }

  // 3. PARTE: ATUALIZAR MARCA D'ÁGUA
  // Salva o timestamp atual para que o próximo sync seja incremental
  const agoraISO = new Date().toISOString();
  db.runSync(
    'INSERT OR REPLACE INTO sync_controle (usuariouuid, ultima_sync_recebimento) VALUES (?, ?)',
    [user.id, agoraISO]
  );

  console.log(`--- [Sync] Sincronismo Finalizado em ${agoraISO} ---`);
};