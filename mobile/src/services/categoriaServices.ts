import * as SQLite from 'expo-sqlite';
import { v4 as uuidv4 } from 'uuid';
import { gravarLog } from '../database/init'; 
import { sanitizarRegistro } from '../lib/sanitizaDados';

const db = SQLite.openDatabaseSync('contamobi.db');

export interface Categoria {
  categoriauuid?: string;
  usuariouuid: string;
  paiuuid?: string | null;
  descricao: string;
  tipo: 'D' | 'C';
  nivel?: number;
  aceita_lancamento?: number;
}

/**
 * SALVAR CATEGORIA (Inclui INSERT e UPDATE)
 * Aplica a regra de 2 níveis: 
 * - Sem pai: Nível 1 (Grupo), não aceita lançamento.
 * - Com pai: Nível 2 (Subcategoria), aceita lançamento.
 */


export const salvarCategoria = async (categoria: Categoria) => {
  const isUpdate = !!categoria.categoriauuid;
  const uuid = categoria.categoriauuid || uuidv4();
  
  // Regra de Negócio Automática
  const nivel = categoria.paiuuid ? 2 : 1;
  const aceita_lancamento = nivel === 2 ? 1 : 0;

  // 1. SANITIZAÇÃO (Obrigatório antes de gravar)
  const { valido, dados, erros } = sanitizarRegistro('categorias', {
    categoriauuid: uuid,
    usuariouuid: categoria.usuariouuid,
    paiuuid: categoria.paiuuid || null,
    descricao: categoria.descricao,
    tipo: categoria.tipo,
    nivel: nivel,
    aceita_lancamento: aceita_lancamento,
  });

  if (!valido) {
    throw new Error(`Erro de validação: ${erros.join(', ')}`);
  }

  try {
    if (isUpdate) {
      // UPDATE Local no SQLite
      db.runSync(
        `UPDATE categorias SET 
          paiuuid = ?, descricao = ?, tipo = ?, nivel = ?, 
          aceita_lancamento = ?, atualizado_em = datetime('now')
         WHERE categoriauuid = ? AND usuariouuid = ?`,
        [
          dados.paiuuid, 
          dados.descricao, 
          dados.tipo, 
          dados.nivel, 
          dados.aceita_lancamento, 
          uuid, 
          dados.usuariouuid
        ]
      );
      
      // Gera Log de UPDATE para o Supabase
      gravarLog(dados.usuariouuid, 'categorias', 'UPDATE', dados);
    } else {
      // INSERT Local no SQLite
      db.runSync(
        `INSERT INTO categorias 
          (categoriauuid, usuariouuid, paiuuid, descricao, tipo, nivel, aceita_lancamento) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          uuid, 
          dados.usuariouuid, 
          dados.paiuuid, 
          dados.descricao, 
          dados.tipo, 
          dados.nivel, 
          dados.aceita_lancamento
        ]
      );

      // Gera Log de INSERT para o Supabase
      gravarLog(dados.usuariouuid, 'categorias', 'INSERT', dados);
    }

    return uuid;
  } catch (error: any) {
    console.error('[CategoriaService] Erro ao persistir dados:', error.message);
    throw error;
  }
};

/**
 * LISTAR PLANO DE CONTAS
 * Retorna a hierarquia para exibição na árvore de categorias.
 */
export const listarCategorias = (usuariouuid: string) => {
  try {
    return db.getAllSync(
      `SELECT * FROM categorias 
       WHERE usuariouuid = ? 
       ORDER BY tipo DESC, nivel ASC, descricao ASC`,
      [usuariouuid]
    );
  } catch (error) {
    return [];
  }
};

/**
 * LISTAR APENAS NÍVEL 1 (Para preencher o seletor de "Categoria Pai")
 */
export const listarCategoriasPais = (usuariouuid: string, tipo: 'D' | 'C') => {
  return db.getAllSync(
    `SELECT categoriauuid, descricao FROM categorias 
     WHERE usuariouuid = ? AND nivel = 1 AND tipo = ?
     ORDER BY descricao ASC`,
    [usuariouuid, tipo]
  );
};

/**
 * ELIMINAR CATEGORIA
 * Impede a exclusão se houver subcategorias vinculadas.
 */
export const eliminarCategoria = (usuariouuid: string, categoriauuid: string) => {
  const temFilhos = db.getFirstSync(
    'SELECT categoriauuid FROM categorias WHERE paiuuid = ? LIMIT 1',
    [categoriauuid]
  );

  if (temFilhos) {
    throw new Error('Não pode excluir uma categoria que tem subcategorias dependentes.');
  }

  db.runSync(
    'DELETE FROM categorias WHERE categoriauuid = ? AND usuariouuid = ?', 
    [categoriauuid, usuariouuid]
  );
  
  // Log de DELETE para o Supabase
  gravarLog(usuariouuid, 'categorias', 'DELETE', { categoriauuid });
};