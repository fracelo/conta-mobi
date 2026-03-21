import * as SQLite from 'expo-sqlite';
import { v4 as uuidv4 } from 'uuid';
import { sanitizarRegistro, sanitizarPayloadLog } from '../lib/sanitizaDados';

const db = SQLite.openDatabaseSync('contamobi.db');

export const initDatabase = () => {

  // APENAS EM DESENVOLVIMENTO — remova antes de publicar!
  db.execSync(`
    DROP TABLE IF EXISTS logsreceber;
    DROP TABLE IF EXISTS logsenviar;
    DROP TABLE IF EXISTS sync_controle;
    DROP TABLE IF EXISTS usuarios;
    DROP TABLE IF EXISTS planos;
  `);

  db.execSync(`
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS planos (
        planouuid TEXT PRIMARY KEY,
        nome TEXT NOT NULL,
        valor REAL,
        limite_transacoes INTEGER,
        criado_em TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS usuarios (
        usuariouuid TEXT PRIMARY KEY,
        planouuid TEXT,
        email TEXT UNIQUE NOT NULL,
        nomecompleto TEXT NOT NULL,
        cpf TEXT,
        celular TEXT,
        datavencimento TEXT,
        sexo TEXT,
        datanascimento TEXT,
        criado_em TEXT DEFAULT (datetime('now')),
        atualizado_em TEXT DEFAULT (datetime('now')),
        FOREIGN KEY (planouuid) REFERENCES planos (planouuid)
    );

    CREATE TABLE IF NOT EXISTS logsenviar (
        logsenviaruuid TEXT PRIMARY KEY,
        usuariouuid TEXT NOT NULL,
        tabela TEXT NOT NULL,
        operacao TEXT NOT NULL,
        payload TEXT NOT NULL,
        payload_sanitizado TEXT,
        ordem INTEGER NOT NULL DEFAULT 0,
        tentativas INTEGER DEFAULT 0,
        erro_codigo TEXT,
        erro_mensagem TEXT,
        tipo_erro TEXT,
        status TEXT DEFAULT 'pendente',
        criado_em TEXT DEFAULT (datetime('now')),
        atualizado_em TEXT DEFAULT (datetime('now')),
        FOREIGN KEY (usuariouuid) REFERENCES usuarios (usuariouuid)
    );

    CREATE TABLE IF NOT EXISTS logsreceber (
        logsreceberuuid TEXT PRIMARY KEY,
        usuariouuid TEXT NOT NULL,
        tabela TEXT NOT NULL,
        operacao TEXT NOT NULL,
        payload TEXT NOT NULL,
        origem TEXT NOT NULL DEFAULT 'web',
        status TEXT DEFAULT 'pendente',
        criado_em TEXT DEFAULT (datetime('now')),
        FOREIGN KEY (usuariouuid) REFERENCES usuarios (usuariouuid)
    );

    CREATE TABLE IF NOT EXISTS sync_controle (
        usuariouuid TEXT PRIMARY KEY,
        ultima_sync_envio TEXT,
        ultima_sync_recebimento TEXT,
        FOREIGN KEY (usuariouuid) REFERENCES usuarios (usuariouuid)
    );
  `);

  // ─── MIGRAÇÕES ───────────────────────────────────────────────────
  // Adiciona colunas novas sem quebrar banco existente
  const migracoes = [
    'ALTER TABLE planos ADD COLUMN limite_transacoes INTEGER',
    'ALTER TABLE planos ADD COLUMN criado_em TEXT DEFAULT (datetime(\'now\'))',
    'ALTER TABLE usuarios ADD COLUMN atualizado_em TEXT DEFAULT (datetime(\'now\'))',
    'ALTER TABLE usuarios ADD COLUMN datavencimento TEXT',
    'ALTER TABLE usuarios ADD COLUMN celular TEXT',
  ];
  for (const sql of migracoes) {
    try { db.execSync(sql); } catch {}
  }

  // ─── PLANOS FIXOS (idênticos ao Supabase) ────────────────────────
  const planoFree = db.getFirstSync(
    'SELECT * FROM planos WHERE planouuid = ?',
    ['e4179d4a-2d4d-457b-80cd-cd00c338d2c1']
  );
  if (!planoFree) {
    db.runSync(
      'INSERT INTO planos (planouuid, nome, valor, limite_transacoes, criado_em) VALUES (?, ?, ?, ?, ?)',
      ['e4179d4a-2d4d-457b-80cd-cd00c338d2c1', 'Free', 0.0, null, '2026-03-17 17:29:08.158005+00']
    );
  }

  const planoPremium = db.getFirstSync(
    'SELECT * FROM planos WHERE planouuid = ?',
    ['00c9c57a-9a9b-4866-8111-9c67d9ec725b']
  );
  if (!planoPremium) {
    db.runSync(
      'INSERT INTO planos (planouuid, nome, valor, limite_transacoes, criado_em) VALUES (?, ?, ?, ?, ?)',
      ['00c9c57a-9a9b-4866-8111-9c67d9ec725b', 'Premium', 19.9, null, '2026-03-17 17:29:08.158005+00']
    );
  }
};

// ─── CADASTRO PRIMEIRO USUÁRIO ────────────────────────────────────

export const cadastrarPrimeiroUsuario = (
  nome: string,
  email: string,
  cpf?: string,
  celular?: string
) => {
  // Sanitiza os dados antes de qualquer operação
  const { valido, dados, erros } = sanitizarRegistro('usuarios', {
    usuariouuid: uuidv4(),
    email,
    nomecompleto: nome,
    cpf: cpf || null,
    celular: celular || null,
    planouuid: 'e4179d4a-2d4d-457b-80cd-cd00c338d2c1', // Free
  });

  if (!valido) {
    console.error('[initDatabase] Erros na sanitização:', erros);
    throw new Error(`Dados inválidos: ${erros.join(', ')}`);
  }

  // Grava no SQLite local
  db.runSync(
    `INSERT INTO usuarios 
      (usuariouuid, email, nomecompleto, cpf, celular, planouuid) 
      VALUES (?, ?, ?, ?, ?, ?)`,
    [
      dados.usuariouuid,
      dados.email,
      dados.nomecompleto,
      dados.cpf,
      dados.celular,
      dados.planouuid,
    ]
  );

  // Grava log de sincronismo
  gravarLog(dados.usuariouuid, 'usuarios', 'INSERT', dados);

  console.log('✓ Usuário local e log de sincronismo criados.');
  return dados.usuariouuid;
};

// ─── FUNÇÕES DE LOG ───────────────────────────────────────────────

export function gravarLog(
  usuariouuid: string,
  tabela: string,
  operacao: 'INSERT' | 'UPDATE' | 'DELETE',
  payload: object
): string {
  const logUuid = uuidv4();

  const ultimaOrdem = db.getFirstSync(
    'SELECT MAX(ordem) as maxOrdem FROM logsenviar WHERE status = "pendente" AND usuariouuid = ?',
    [usuariouuid]
  ) as any;
  const ordem = (ultimaOrdem?.maxOrdem ?? 0) + 1;

  const payloadOriginal = JSON.stringify(payload);
  const payloadSanitizado = sanitizarPayloadLog(tabela, payload as Record<string, any>);

  db.runSync(
    `INSERT INTO logsenviar 
      (logsenviaruuid, usuariouuid, tabela, operacao, payload, payload_sanitizado, ordem, status) 
      VALUES (?, ?, ?, ?, ?, ?, ?, 'pendente')`,
    [logUuid, usuariouuid, tabela, operacao, payloadOriginal, payloadSanitizado, ordem]
  );

  return logUuid;
}

export function marcarLogEnviado(logsenviaruuid: string): void {
  db.runSync(
    `UPDATE logsenviar 
     SET status = 'enviado', atualizado_em = datetime('now') 
     WHERE logsenviaruuid = ?`,
    [logsenviaruuid]
  );
}

export function marcarLogErro(
  logsenviaruuid: string,
  codigo: string,
  mensagem: string,
  tipo: 'temporario' | 'permanente'
): void {
  db.runSync(
    `UPDATE logsenviar SET 
      status = ?,
      erro_codigo = ?,
      erro_mensagem = ?,
      tipo_erro = ?,
      tentativas = tentativas + 1,
      atualizado_em = datetime('now')
     WHERE logsenviaruuid = ?`,
    [
      tipo === 'permanente' ? 'erro_permanente' : 'erro_temporario',
      codigo,
      mensagem,
      tipo,
      logsenviaruuid,
    ]
  );
}

export function buscarLogsPendentes(usuariouuid: string): any[] {
  return db.getAllSync(
    `SELECT * FROM logsenviar 
     WHERE usuariouuid = ?
     AND status IN ('pendente', 'erro_temporario') 
     AND (tipo_erro IS NULL OR tipo_erro = 'temporario')
     AND tentativas < 3
     ORDER BY ordem ASC`,
    [usuariouuid]
  );
}