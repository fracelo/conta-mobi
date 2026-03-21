// ─────────────────────────────────────────────────────────────────
// sanitizaDados.ts
// Sanitiza dados antes de salvar no SQLite e no payload de logs
// Protege contra SQL Injection, caracteres especiais e tipos inválidos
// ─────────────────────────────────────────────────────────────────

// ─── TIPOS ───────────────────────────────────────────────────────

type TipoCampo =
  | 'texto'
  | 'email'
  | 'numero'
  | 'decimal'
  | 'booleano'
  | 'data'
  | 'datahora'
  | 'uuid'
  | 'json';

interface CampoSchema {
  tipo: TipoCampo;
  obrigatorio?: boolean;
  tamanhoMax?: number;
}

interface Schema {
  [campo: string]: CampoSchema;
}

interface ResultadoSanitizacao {
  valido: boolean;
  dados: Record<string, any>;
  erros: string[];
}

// ─── SCHEMAS DAS TABELAS ─────────────────────────────────────────

export const schemas: Record<string, Schema> = {
  usuarios: {
    usuariouuid:   { tipo: 'uuid',    obrigatorio: true },
    planouuid:     { tipo: 'uuid',    obrigatorio: false },
    email:         { tipo: 'email',   obrigatorio: true,  tamanhoMax: 255 },
    nomecompleto:  { tipo: 'texto',   obrigatorio: true,  tamanhoMax: 255 },
    cpf:           { tipo: 'texto',   obrigatorio: false, tamanhoMax: 14 },
    celular:       { tipo: 'texto',   obrigatorio: false, tamanhoMax: 20 },
    datavencimento:{ tipo: 'data',    obrigatorio: false },
    sexo:          { tipo: 'texto',   obrigatorio: false, tamanhoMax: 20 },
    datanascimento:{ tipo: 'data',    obrigatorio: false },
  },
  planos: {
    planouuid:     { tipo: 'uuid',    obrigatorio: true },
    nome:          { tipo: 'texto',   obrigatorio: true,  tamanhoMax: 100 },
    valor:         { tipo: 'decimal', obrigatorio: false },
  },
};

// ─── FUNÇÕES DE SANITIZAÇÃO POR TIPO ─────────────────────────────

function sanitizarTexto(valor: any, tamanhoMax?: number): string {
  if (valor === null || valor === undefined) return '';
  let v = String(valor)
    .replace(/'/g, "''")           // escapa apostrofes para SQL
    .replace(/\\/g, '\\\\')        // escapa barras invertidas
    .replace(/\0/g, '')            // remove null bytes
    .replace(/[\x00-\x1F\x7F]/g, '') // remove caracteres de controle
    .trim();

  // Bloqueia padrões de SQL Injection
  const sqlInjectionPatterns = [
    /(\b)(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|TRUNCATE|REPLACE)(\b)/gi,
    /(--|\/\*|\*\/|;)/g,
    /(\bOR\b|\bAND\b)\s+[\w'"]+=[\w'"]+/gi,
  ];
  for (const pattern of sqlInjectionPatterns) {
    if (pattern.test(v)) {
      v = v.replace(pattern, ''); // remove o padrão suspeito
    }
  }

  if (tamanhoMax && v.length > tamanhoMax) {
    v = v.substring(0, tamanhoMax);
  }
  return v;
}

function sanitizarEmail(valor: any): string | null {
  if (!valor) return null;
  const v = String(valor).trim().toLowerCase();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(v) ? v : null;
}

function sanitizarNumero(valor: any): number | null {
  if (valor === null || valor === undefined || valor === '') return null;
  const n = Number(valor);
  return isNaN(n) ? null : Math.floor(n);
}

function sanitizarDecimal(valor: any): number | null {
  if (valor === null || valor === undefined || valor === '') return null;
  const n = parseFloat(String(valor).replace(',', '.'));
  return isNaN(n) ? null : parseFloat(n.toFixed(2));
}

function sanitizarBooleano(valor: any): number {
  // SQLite não tem boolean — usa 0/1
  if (valor === true || valor === 1 || valor === 'true' || valor === '1') return 1;
  return 0;
}

function sanitizarData(valor: any): string | null {
  if (!valor) return null;
  // Aceita DD/MM/AAAA ou AAAA-MM-DD
  const v = String(valor).trim();
  const ptBR = /^(\d{2})\/(\d{2})\/(\d{4})$/;
  const iso  = /^(\d{4})-(\d{2})-(\d{2})$/;

  if (ptBR.test(v)) {
    const [, d, m, a] = v.match(ptBR)!;
    return `${a}-${m}-${d}`; // converte para ISO para o Supabase
  }
  if (iso.test(v)) return v;
  return null;
}

function sanitizarDataHora(valor: any): string | null {
  if (!valor) return null;
  const v = String(valor).trim();
  // Aceita AAAA-MM-DD HH:MM:SS ou ISO 8601
  const iso = /^\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}(:\d{2})?/;
  return iso.test(v) ? v : null;
}

function sanitizarUuid(valor: any): string | null {
  if (!valor) return null;
  const v = String(valor).trim().toLowerCase();
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
  return uuidRegex.test(v) ? v : null;
}

function sanitizarJson(valor: any): string | null {
  if (!valor) return null;
  try {
    const obj = typeof valor === 'string' ? JSON.parse(valor) : valor;
    return JSON.stringify(obj);
  } catch {
    return null;
  }
}

// ─── FUNÇÃO PRINCIPAL ─────────────────────────────────────────────

export function sanitizarRegistro(
  tabela: string,
  dados: Record<string, any>
): ResultadoSanitizacao {
  const schema = schemas[tabela];
  const resultado: Record<string, any> = {};
  const erros: string[] = [];

  if (!schema) {
    // Tabela sem schema definido — sanitiza tudo como texto
    for (const campo in dados) {
      resultado[campo] = sanitizarTexto(dados[campo]);
    }
    return { valido: true, dados: resultado, erros: [] };
  }

  for (const campo in schema) {
    const def = schema[campo];
    const valor = dados[campo];

    // Verifica obrigatoriedade
    if (def.obrigatorio && (valor === null || valor === undefined || valor === '')) {
      erros.push(`Campo obrigatório não preenchido: ${campo}`);
      resultado[campo] = null;
      continue;
    }

    // Sanitiza por tipo
    switch (def.tipo) {
      case 'texto':
        resultado[campo] = valor ? sanitizarTexto(valor, def.tamanhoMax) : null;
        break;
      case 'email':
        resultado[campo] = sanitizarEmail(valor);
        if (def.obrigatorio && !resultado[campo]) {
          erros.push(`E-mail inválido: ${campo}`);
        }
        break;
      case 'numero':
        resultado[campo] = sanitizarNumero(valor);
        break;
      case 'decimal':
        resultado[campo] = sanitizarDecimal(valor);
        break;
      case 'booleano':
        resultado[campo] = sanitizarBooleano(valor);
        break;
      case 'data':
        resultado[campo] = sanitizarData(valor);
        break;
      case 'datahora':
        resultado[campo] = sanitizarDataHora(valor);
        break;
      case 'uuid':
        resultado[campo] = sanitizarUuid(valor);
        if (def.obrigatorio && !resultado[campo]) {
          erros.push(`UUID inválido: ${campo}`);
        }
        break;
      case 'json':
        resultado[campo] = sanitizarJson(valor);
        break;
      default:
        resultado[campo] = sanitizarTexto(valor, def.tamanhoMax);
    }
  }

  // Campos extras não definidos no schema são ignorados (proteção extra)
  return {
    valido: erros.length === 0,
    dados: resultado,
    erros,
  };
}

// ─── USO NO PAYLOAD DO LOG ────────────────────────────────────────

export function sanitizarPayloadLog(tabela: string, dados: Record<string, any>): string {
  const { dados: dadosSanitizados } = sanitizarRegistro(tabela, dados);
  return JSON.stringify(dadosSanitizados);
}