import * as SQLite from 'expo-sqlite';
const db = SQLite.openDatabaseSync('contamobi.db');

export const verificarPermissaoCadastro = (usuariouuid: string, tipo: 'bancos' | 'contas_correntes') => {
  // 1. Busca os dados do usuário e do plano dele
  const queryUser = `
    SELECT u.data_vencimento, p.limite_bancos, p.limite_contas 
    FROM usuarios u
    LEFT JOIN planos p ON u.planouuid = p.planouuid
    WHERE u.usuariouuid = ?
  `;
  const userData = db.getFirstSync(queryUser, [usuariouuid]) as any;

  // 2. Lógica de Carência (15 dias após o vencimento)
  const hoje = new Date();
  const vencimento = userData?.data_vencimento ? new Date(userData.data_vencimento) : null;
  
  let bloqueadoPorInadimplencia = false;
  if (vencimento) {
    const dataLimite = new Date(vencimento);
    dataLimite.setDate(dataLimite.getDate() + 15);
    if (hoje > dataLimite) {
      bloqueadoPorInadimplencia = true;
    }
  }

  // 3. Se for Premium em dia, libera geral (ou usa um limite muito alto)
  if (userData?.data_vencimento && !bloqueadoPorInadimplencia) {
    return { autorizado: true };
  }

  // 4. Se for FREE ou BLOQUEADO, checa o limite específico do plano
  const limitePermitido = tipo === 'bancos' ? (userData?.limite_bancos || 3) : (userData?.limite_contas || 3);
  
  const contagem = db.getFirstSync(
    `SELECT count(*) as total FROM ${tipo} WHERE usuariouuid = ?`, 
    [usuariouuid]
  ) as any;

  if (contagem.total >= limitePermitido) {
    return { 
      autorizado: false, 
      mensagem: `Você atingiu o limite de ${limitePermitido} ${tipo === 'bancos' ? 'bancos' : 'contas'} do plano Free. Faça o upgrade para o Premium!` 
    };
  }

  return { autorizado: true };
};