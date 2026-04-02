import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Alert, 
  ScrollView, Switch, ActivityIndicator, Platform, StatusBar
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';

import FloatingInput from '../../components/FloatingInput';
import { colors, spacing, borderRadius, shadows } from '../../theme';
import { salvarCategoria, eliminarCategoria, listarCategoriasPais } from '../../services/categoriaServices';
import { usuarioAtual } from '../../services/auth';

export default function FormCategoria() {
  const navigation = useNavigation();
  const route = useRoute<any>();
  
  // Parâmetros vindos da navegação
  const { categoria, tipo: tipoInicial } = route.params || {};
  const isEdit = !!categoria;

  // Estados do Formulário
  const [loading, setLoading] = useState(false);
  const [descricao, setDescricao] = useState(categoria?.descricao || '');
  const [tipo, setTipo] = useState<'D' | 'C'>(categoria?.tipo || tipoInicial || 'D');
  const [isSubcategoria, setIsSubcategoria] = useState(!!categoria?.paiuuid);
  const [paiuuid, setPaiuuid] = useState(categoria?.paiuuid || null);
  
  // Lista de categorias Nível 1 para o seletor
  const [listaPais, setListaPais] = useState<any[]>([]);

  useEffect(() => {
    carregarCategoriasPai();
  }, [tipo]);

  const carregarCategoriasPai = async () => {
    const user = await usuarioAtual();
    if (user) {
      // Busca apenas categorias Nível 1 do mesmo tipo (C ou D)
      const pais = listarCategoriasPais(user.id, tipo);
      // Se estiver editando, remove a própria categoria da lista de pais (evita auto-referência)
      const paisFiltrados = pais.filter((p: any) => p.categoriauuid !== categoria?.categoriauuid);
      setListaPais(paisFiltrados);
    }
  };

  const handleSalvar = async () => {
    if (!descricao.trim()) {
      Alert.alert('Atenção', 'A descrição é obrigatória.');
      return;
    }

    if (isSubcategoria && !paiuuid) {
      Alert.alert('Atenção', 'Selecione uma categoria pai para esta subcategoria.');
      return;
    }

    try {
      setLoading(true);
      const user = await usuarioAtual();
      
      if (!user) throw new Error('Usuário não autenticado.');

      await salvarCategoria({
        categoriauuid: categoria?.categoriauuid, // Envia se for edit, null se for novo
        usuariouuid: user.id,
        descricao: descricao.trim(),
        tipo,
        paiuuid: isSubcategoria ? paiuuid : null,
      });

      Alert.alert('Sucesso', 'Categoria salva com sucesso!');
      navigation.goBack();
    } catch (error: any) {
      Alert.alert('Erro', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleExcluir = () => {
    Alert.alert('Excluir', 'Tem certeza que deseja remover esta categoria?', [
      { text: 'Cancelar', style: 'cancel' },
      { 
        text: 'Excluir', 
        style: 'destructive', 
        onPress: async () => {
          try {
            const user = await usuarioAtual();
            eliminarCategoria(user!.id, categoria.categoriauuid);
            navigation.goBack();
          } catch (error: any) {
            Alert.alert('Erro ao excluir', error.message);
          }
        } 
      }
    ]);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* AppBar */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerButton}>
          <Ionicons name="close" size={26} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{isEdit ? 'Editar Categoria' : 'Nova Categoria'}</Text>
        <View style={styles.headerButton} /> 
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.card}>
          
          <FloatingInput
            label="Nome da Categoria"
            value={descricao}
            onChangeText={(v: string) => setDescricao(v)}
            autoFocus={!isEdit}
          />

          {/* Seletor de Tipo (Bloqueado se for Subcategoria, pois herda do Pai) */}
          {!isSubcategoria && (
            <View style={styles.tipoContainer}>
              <Text style={styles.sectionLabel}>Tipo de Categoria</Text>
              <View style={styles.tipoRow}>
                <TouchableOpacity 
                  style={[styles.tipoBtn, tipo === 'D' && styles.tipoBtnD]} 
                  onPress={() => setTipo('D')}
                >
                  <Text style={[styles.tipoBtnText, tipo === 'D' && styles.tipoBtnTextAtivo]}>Despesa</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.tipoBtn, tipo === 'C' && styles.tipoBtnC]} 
                  onPress={() => setTipo('C')}
                >
                  <Text style={[styles.tipoBtnText, tipo === 'C' && styles.tipoBtnTextAtivo]}>Receita</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Toggle Subcategoria */}
          <View style={styles.switchRow}>
            <View>
              <Text style={styles.switchLabel}>Esta é uma subcategoria?</Text>
              <Text style={styles.switchSublabel}>Vincular a um grupo principal</Text>
            </View>
            <Switch 
              value={isSubcategoria} 
              onValueChange={(val) => {
                setIsSubcategoria(val);
                if (!val) setPaiuuid(null);
              }}
              trackColor={{ false: '#EEE', true: colors.primaryLight }}
              thumbColor={isSubcategoria ? colors.primary : '#BCBCBC'}
            />
          </View>

          {/* Seletor de Pai */}
          {isSubcategoria && (
            <View style={styles.paiSection}>
              <Text style={styles.sectionLabel}>Selecione o Grupo Pai</Text>
              <View style={styles.gridPais}>
                {listaPais.map((p) => (
                  <TouchableOpacity 
                    key={p.categoriauuid}
                    style={[styles.chipPai, paiuuid === p.categoriauuid && styles.chipPaiAtivo]}
                    onPress={() => setPaiuuid(p.categoriauuid)}
                  >
                    <Text style={[styles.chipPaiText, paiuuid === p.categoriauuid && styles.chipPaiTextAtivo]}>
                      {p.descricao}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              {listaPais.length === 0 && (
                <Text style={styles.errorText}>Nenhum grupo de {tipo === 'D' ? 'despesa' : 'receita'} cadastrado.</Text>
              )}
            </View>
          )}

          {/* Botões de Ação */}
          <View style={styles.footer}>
            {isEdit && (
              <TouchableOpacity style={styles.btnExcluir} onPress={handleExcluir}>
                <Ionicons name="trash-outline" size={22} color="#FF5252" />
              </TouchableOpacity>
            )}
            <TouchableOpacity 
              style={[styles.btnSalvar, loading && { opacity: 0.7 }]} 
              onPress={handleSalvar}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.btnSalvarText}>Gravar Categoria</Text>
              )}
            </TouchableOpacity>
          </View>

        </View>
      </ScrollView>
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
    paddingHorizontal: spacing.sm,
    paddingBottom: spacing.sm,
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight ?? 24) : 44,
  },
  headerTitle: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
  headerButton: { width: 48, height: 48, justifyContent: 'center', alignItems: 'center' },
  content: { padding: spacing.lg },
  card: { backgroundColor: '#FFF', borderRadius: borderRadius.lg, padding: spacing.xl, ...shadows.card },
  sectionLabel: { fontSize: 12, color: colors.primary, fontWeight: 'bold', marginBottom: 10, textTransform: 'uppercase' },
  tipoContainer: { marginVertical: spacing.md },
  tipoRow: { flexDirection: 'row', gap: 10 },
  tipoBtn: { flex: 1, height: 40, borderRadius: borderRadius.sm, borderWidth: 1, borderColor: '#DDD', justifyContent: 'center', alignItems: 'center' },
  tipoBtnD: { backgroundColor: '#FFF0F0', borderColor: '#FF5252' },
  tipoBtnC: { backgroundColor: '#F0FFF4', borderColor: '#4CAF50' },
  tipoBtnText: { color: '#888', fontWeight: '500' },
  tipoBtnTextAtivo: { fontWeight: 'bold', color: colors.text },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: spacing.md, borderTopWidth: 1, borderTopColor: '#F0F0F0', marginTop: spacing.sm },
  switchLabel: { fontSize: 15, color: colors.text, fontWeight: '500' },
  switchSublabel: { fontSize: 12, color: '#999' },
  paiSection: { marginTop: spacing.sm },
  gridPais: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chipPai: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, backgroundColor: '#F5F5F5', borderWidth: 1, borderColor: '#EEE' },
  chipPaiAtivo: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipPaiText: { fontSize: 13, color: '#666' },
  chipPaiTextAtivo: { color: '#FFF', fontWeight: 'bold' },
  footer: { flexDirection: 'row', marginTop: 30, gap: spacing.md },
  btnSalvar: { flex: 1, height: 55, backgroundColor: colors.primary, borderRadius: borderRadius.md, justifyContent: 'center', alignItems: 'center', ...shadows.card },
  btnSalvarText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
  btnExcluir: { width: 55, height: 55, borderRadius: borderRadius.md, borderWidth: 1.5, borderColor: '#FF5252', justifyContent: 'center', alignItems: 'center' },
  errorText: { color: '#FF5252', fontSize: 12, marginTop: 5 },
});