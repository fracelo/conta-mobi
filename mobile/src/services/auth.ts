import { supabase } from './supabase';
import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabaseSync('contamobi.db');

// ─── LOGIN ────────────────────────────────────────────────────────
export async function login(email: string, senha: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.trim().toLowerCase(),
    password: senha,
  });

  if (error) throw new Error(error.message);

  // Salva/atualiza dados do usuário localmente
  await sincronizarUsuarioLocal(data.user.id);

  return data;
}

// ─── LOGOUT ───────────────────────────────────────────────────────
export async function logout() {
  await supabase.auth.signOut();
}

// ─── VERIFICAR SESSÃO ─────────────────────────────────────────────
export async function verificarSessao() {
  const { data } = await supabase.auth.getSession();
  return data.session;
}

// ─── BUSCAR USUÁRIO ATUAL ─────────────────────────────────────────
export async function usuarioAtual() {
  const { data } = await supabase.auth.getUser();
  return data.user;
}

// ─── SINCRONIZAR USUÁRIO LOCAL ────────────────────────────────────
// Busca dados do usuário no Supabase e salva no SQLite
async function sincronizarUsuarioLocal(usuariouuid: string) {
  const { data, error } = await supabase
    .from('usuarios')
    .select('*, planos(nome, valor)')
    .eq('usuariouuid', usuariouuid)
    .single();

  if (error || !data) {
    console.warn('[Auth] Usuário não encontrado no Supabase:', error?.message);
    return;
  }

  // Verifica se já existe local
  const existeLocal = db.getFirstSync(
    'SELECT usuariouuid FROM usuarios WHERE usuariouuid = ?',
    [usuariouuid]
  );

  if (existeLocal) {
    // Atualiza dados locais
    db.runSync(
      `UPDATE usuarios SET
        nomecompleto = ?, email = ?, cpf = ?, celular = ?,
        planouuid = ?, datavencimento = ?, sexo = ?,
        datanascimento = ?, atualizado_em = datetime('now')
       WHERE usuariouuid = ?`,
      [
        data.nomecompleto,
        data.email,
        data.cpf || null,
        data.celular || null,
        data.planouuid,
        data.datavencimento || null,
        data.sexo || null,
        data.datanascimento || null,
        usuariouuid,
      ]
    );
  } else {
    // Insere novo usuário local
    db.runSync(
      `INSERT INTO usuarios
        (usuariouuid, email, nomecompleto, cpf, celular, planouuid, datavencimento, sexo, datanascimento)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        usuariouuid,
        data.email,
        data.nomecompleto,
        data.cpf || null,
        data.celular || null,
        data.planouuid,
        data.datavencimento || null,
        data.sexo || null,
        data.datanascimento || null,
      ]
    );
  }

  console.log('[Auth] Usuário sincronizado localmente.');
}