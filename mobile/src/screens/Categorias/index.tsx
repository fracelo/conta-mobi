import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  StatusBar, Platform, ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';

import { colors, spacing, borderRadius, shadows } from '../../theme';
import { listarCategorias } from '../../services/categoriaServices';
import { organizarCategoriasParaArvore, CategoriaNode } from '../../lib/groupCategorias';
import { usuarioAtual } from '../../services/auth';

export default function ListaCategorias() {
  const navigation = useNavigation<any>();
  const [loading, setLoading] = useState(true);
  const [tipoFiltro, setTipoFiltro] = useState<'D' | 'C'>('D');
  const [categoriasArvore, setCategoriasArvore] = useState<CategoriaNode[]>([]);

  // Recarrega os dados sempre que a tela ganha foco
  useFocusEffect(
    useCallback(() => {
      carregarDados();
    }, [tipoFiltro])
  );

  const carregarDados = async () => {
    try {
      setLoading(true);
      const user = await usuarioAtual();
      if (user) {
        const todas = listarCategorias(user.id);
        // Filtra pelo tipo (D ou C) antes de montar a árvore
        const filtradas = todas.filter((c: any) => c.tipo === tipoFiltro);
        const arvore = organizarCategoriasParaArvore(filtradas);
        setCategoriasArvore(arvore);
      }
    } catch (error) {
      console.error('[ListaCategorias] Erro:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Header / AppBar */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerButton}>
          <Ionicons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Plano de Contas</Text>
        <TouchableOpacity 
          onPress={() => navigation.navigate('FormCategoria', { tipo: tipoFiltro })} 
          style={styles.headerButton}
        >
          <Ionicons name="add" size={28} color="#FFF" />
        </TouchableOpacity>
      </View>

      {/* Seletor de Tipo (Tabs) */}
      <View style={styles.tabBar}>
        <TouchableOpacity 
          style={[styles.tabItem, tipoFiltro === 'D' && styles.tabAtiva]}
          onPress={() => setTipoFiltro('D')}
        >
          <Ionicons name="trending-down" size={20} color={tipoFiltro === 'D' ? colors.primary : '#888'} />
          <Text style={[styles.tabText, tipoFiltro === 'D' && styles.tabTextAtivo]}>Despesas</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.tabItem, tipoFiltro === 'C' && styles.tabAtiva]}
          onPress={() => setTipoFiltro('C')}
        >
          <Ionicons name="trending-up" size={20} color={tipoFiltro === 'C' ? colors.primary : '#888'} />
          <Text style={[styles.tabText, tipoFiltro === 'C' && styles.tabTextAtivo]}>Receitas</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {categoriasArvore.length === 0 && (
            <Text style={styles.emptyText}>Nenhuma categoria cadastrada.</Text>
          )}

          {categoriasArvore.map((pai) => (
            <View key={pai.categoriauuid} style={styles.cardGrupo}>
              {/* Item Pai (Nível 1) */}
              <TouchableOpacity 
                style={styles.itemPai}
                onPress={() => navigation.navigate('FormCategoria', { categoria: pai })}
              >
                <View style={styles.infoPai}>
                  <View style={[styles.indicator, { backgroundColor: tipoFiltro === 'D' ? '#FF5252' : '#4CAF50' }]} />
                  <Text style={styles.txtPai}>{pai.descricao}</Text>
                </View>
                <Ionicons name="pencil-outline" size={18} color="#CCC" />
              </TouchableOpacity>

              {/* Itens Filhos (Nível 2) */}
              {pai.subcategorias.map((filho) => (
                <TouchableOpacity 
                  key={filho.categoriauuid}
                  style={styles.itemFilho}
                  onPress={() => navigation.navigate('FormCategoria', { categoria: filho })}
                >
                  <View style={styles.filhoLead}>
                    <View style={styles.curvaConexao} />
                    <Text style={styles.txtFilho}>{filho.descricao}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={14} color="#EEE" />
                </TouchableOpacity>
              ))}
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight ?? 24) : 44,
    elevation: 4,
  },
  headerTitle: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
  headerButton: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center' },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    elevation: 2,
    marginBottom: spacing.sm,
  },
  tabItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    gap: 8,
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  tabAtiva: { borderBottomColor: colors.primary },
  tabText: { fontSize: 14, color: '#888', fontWeight: '500' },
  tabTextAtivo: { color: colors.primary, fontWeight: 'bold' },
  scrollContent: { padding: spacing.md, paddingBottom: 40 },
  cardGrupo: {
    backgroundColor: '#FFF',
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
    overflow: 'hidden',
    ...shadows.card,
  },
  itemPai: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    backgroundColor: '#F9F9F9',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  infoPai: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  indicator: { width: 4, height: 18, borderRadius: 2 },
  txtPai: { fontSize: 16, fontWeight: 'bold', color: colors.text },
  itemFilho: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingRight: spacing.md,
    marginLeft: spacing.lg,
  },
  filhoLead: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  curvaConexao: {
    width: 10,
    height: 10,
    borderLeftWidth: 1.5,
    borderBottomWidth: 1.5,
    borderColor: '#DDD',
    marginTop: -10,
  },
  txtFilho: { fontSize: 14, color: '#555' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { textAlign: 'center', marginTop: 40, color: '#999' },
});