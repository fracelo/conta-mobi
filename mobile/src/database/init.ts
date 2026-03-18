import * as SQLite from 'expo-sqlite';
import { v4 as uuidv4 } from 'uuid';

const db = SQLite.openDatabaseSync('contamobi.db');

export const initDatabase = () => {
  db.execSync(`
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS planos (
        planouuid TEXT PRIMARY KEY,
        nome TEXT NOT NULL,
        valor REAL
    );

    CREATE TABLE IF NOT EXISTS usuarios (
        usuariouuid TEXT PRIMARY KEY,
        planouuid TEXT,
        email TEXT UNIQUE NOT NULL,
        nomecompleto TEXT NOT NULL,
        cpf TEXT,
        sexo TEXT,
        datanascimento TEXT,
        FOREIGN KEY (planouuid) REFERENCES planos (planouuid)
    );

    CREATE TABLE IF NOT EXISTS logsenviar (
        logsenviaruuid TEXT PRIMARY KEY,
        tabela TEXT NOT NULL,
        operacao TEXT NOT NULL,
        payload TEXT NOT NULL,
        status TEXT DEFAULT 'pendente',
        criado_em TEXT DEFAULT (datetime('now'))
    );
  `);

  // Inserir plano inicial se não existir
  const planoExistente = db.getFirstSync('SELECT * FROM planos WHERE nome = "Free"');
  if (!planoExistente) {
    db.runSync('INSERT INTO planos (planouuid, nome, valor) VALUES (?, ?, ?)', [uuidv4(), 'Free', 0.0]);
  }
};

// --- ESTA É A FUNÇÃO QUE ESTAVA FALTANDO ---
export const cadastrarPrimeiroUsuario = (nome: string, email: string, cpf?: string) => {
  const userUuid = uuidv4();
  
  // Busca o UUID do plano Free que acabamos de garantir que existe
  const planoFree = db.getFirstSync('SELECT planouuid FROM planos WHERE nome = "Free"') as any;

  // 1. Grava no SQLite local (Perfil do Usuário)
  db.runSync(
    'INSERT INTO usuarios (usuariouuid, email, nomecompleto, cpf, planouuid) VALUES (?, ?, ?, ?, ?)',
    [userUuid, email, nome, cpf || null, planoFree?.planouuid]
  );

  // 2. Gera o LOG para o Supabase (Sincronismo Offline-First)
  const logUuid = uuidv4();
  const payload = JSON.stringify({
    usuariouuid: userUuid,
    email: email,
    nomecompleto: nome,
    cpf: cpf || null,
    planouuid: planoFree?.planouuid
  });

  db.runSync(
    'INSERT INTO logsenviar (logsenviaruuid, tabela, operacao, payload) VALUES (?, ?, ?, ?)',
    [logUuid, 'usuarios', 'INSERT', payload]
  );

  console.log("✓ Usuário local e log de sincronismo criados.");
  return userUuid;
};