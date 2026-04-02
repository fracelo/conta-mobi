export interface CategoriaNode {
  categoriauuid: string;
  descricao: string;
  tipo: 'D' | 'C';
  nivel: number;
  paiuuid: string | null;
  aceita_lancamento: number;
  subcategorias: CategoriaNode[];
}

export const organizarCategoriasParaArvore = (listaFlat: any[]): CategoriaNode[] => {
  const pais = listaFlat.filter(c => c.paiuuid === null);
  const filhos = listaFlat.filter(c => c.paiuuid !== null);

  return pais.map(pai => ({
    ...pai,
    subcategorias: filhos.filter(f => f.paiuuid === pai.categoriauuid)
  }));
};