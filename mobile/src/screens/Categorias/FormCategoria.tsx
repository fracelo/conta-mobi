import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Alert, 
  ScrollView, ActivityIndicator, Platform, StatusBar
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Picker } from '@react-native-picker/picker';

import FloatingInput from '../../components/FloatingInput';
import { colors, spacing, borderRadius, shadows } from '../../theme';
import { salvarCategoria, eliminarCategoria, listarCategoriasPais } from '../../services/categoriaServices';
import { usuarioAtual } from '../../services/auth';

export default function FormCategoria() {
  const navigation = useNavigation();
  const route = useRoute<any>();
  
  // Captura dados da navegação (se for edição, vem o objeto categoria)
  const { categoria, tipo: tipoInicial } = route.params || {};
  const isEdit = !!categoria;

  // Estados
  const [loading, setLoading] = useState(false);
  const [descricao, setDescricao] = useState(categoria?.descricao || '');
  const [tipo, setTipo] = useState<'D' | 'C'>(categoria?.tipo || tipoInicial || 'D');
  const [paiuuid, setPaiuuid] = useState<string | null>(categoria?.paiuuid || null);
  const [listaPais, setListaPais] = useState<any[]>([]);

  // Lógica de UX: Nível 1 (Pai) ou Nível 2 (Sub)
  const nivelVisual = paiuuid ? 2 : 1;

  useEffect(() => {
    carregarCategoriasPai();
  }, [tipo]);

  const carregarCategoriasPai = async () => {
    try {
      const user = await usuarioAtual();
      if (user) {
        // Busca apenas categorias que são Nível 1 (sem paiuuid)
        const pais = listarCategoriasPais(user.id, tipo);
        // Filtra para não permitir que a categoria seja pai de si mesma
        const filtrados = pais.filter((p: any) => p.categoriauuid !== categoria?.categoriauuid);
        setListaPais(filtrados);
      }
    } catch (error) {
      console.error("Erro ao carregar categorias pai:", error);
    }
  };

  const handleSalvar = async () => {
    if (!descricao.trim()) {
      Alert.alert('Atenção', 'O nome da categoria é obrigatório.');
      return;
    }

    try {
      setLoading(true);
      const user = await usuarioAtual();
      
      if (!user) throw new Error("Usuário não autenticado.");

      await salvarCategoria({
        categoriauuid: categoria?.categoriauuid,
        usuariouuid: user.id,
        descricao: descricao.trim(),
        tipo,
        paiuuid: paiuuid || null, // Se null, o service grava como Nível 1
      });

      Alert.alert('Sucesso', 'Categoria salva com sucesso!');
      navigation.goBack();
    } catch (error: any) {
      Alert.alert('Erro ao salvar', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleExcluir = () => {
    Alert.alert('Excluir', 'Deseja realmente remover esta categoria?', [
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
            Alert.alert('Erro', error.message);
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
          <Ionicons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{isEdit ? 'Editar' : 'Nova'} Categoria</Text>
        <View style={styles.headerButton} />
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.card}>
          
          {/* 1. Tipo de Categoria */}
          <Text style={styles.label}>Tipo de Categoria</Text>
          <View style={styles.pickerWrapper}>
            <Picker
              selectedValue={tipo}
              onValueChange={(itemValue) => setTipo(itemValue)}
              style={styles.picker}
              // Bloqueia troca de tipo se for subcategoria (ela deve seguir o pai)
              enabled={!paiuuid}
            >
              <Picker.Item label="Despesa" value="D" color="#FF5252" />
              <Picker.Item label="Receita" value="C" color="#4CAF50" />
            </Picker>
          </View>

          {/* 2. Nome da Categoria */}
          <View style={styles.inputGap}>
            <FloatingInput
              label="Nome da Categoria"
              value={descricao}
              onChangeText={setDescricao}
              autoFocus={!isEdit}
            />
          </View>

          {/* 3. Conta Pai */}
          <Text style={[styles.label, styles.inputGap]}>Conta Pai (Opcional)</Text>
          <View style={styles.pickerWrapper}>
            <Picker
              selectedValue={paiuuid}
              onValueChange={(itemValue) => setPaiuuid(itemValue)}
              style={styles.picker}
            >
              <Picker.Item label="Nenhuma (Esta será Nível 1)" value={null} />
              {listaPais.map((p) => (
                <Picker.Item key={p.categoriauuid} label={p.descricao} value={p.categoriauuid} />
              ))}
            </Picker>
          </View>

          {/* 4. Observação de Nível Dinâmica */}
          <View style={[styles.infoBox, nivelVisual === 2 ? styles.infoBoxSub : styles.infoBoxPai]}>
            <Ionicons 
              name={nivelVisual === 1 ? "layers" : "return-down-forward"} 
              size={20} 
              color={colors.primary} 
            />
            <View>
              <Text style={styles.infoText}>
                Definida como: <Text style={styles.bold}>Nível {nivelVisual}</Text>
              </Text>
              <Text style={styles.infoSubtext}>
                {nivelVisual === 1 
                  ? 'Categoria principal para agrupamento.' 
                  : 'Subcategoria vinculada ao grupo selecionado.'}
              </Text>
            </View>
          </View>

          {/* Ações */}
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
                <Text style={styles.btnText}>Salvar Categoria</Text>
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
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight ?? 24) + 10 : 50,
    paddingBottom: 20,
    paddingHorizontal: 15,
  },
  headerTitle: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
  headerButton: { width: 40, alignItems: 'center' },
  content: { padding: spacing.lg },
  card: { 
    backgroundColor: '#FFF', 
    borderRadius: borderRadius.lg, 
    padding: spacing.xl, 
    ...shadows.card 
  },
  label: { 
    fontSize: 12, 
    color: colors.primary, 
    fontWeight: '700', 
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5
  },
  pickerWrapper: {
    backgroundColor: '#F8F9FA',
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: '#E9ECEF',
    overflow: 'hidden',
    marginBottom: spacing.xs
  },
  picker: { height: 55, width: '100%' },
  inputGap: { marginTop: spacing.lg },
  infoBox: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    padding: 15, 
    borderRadius: borderRadius.md,
    marginTop: 30,
    gap: 12,
    borderWidth: 1,
  },
  infoBoxPai: { backgroundColor: '#F0FFF4', borderColor: '#C6F6D5' },
  infoBoxSub: { backgroundColor: '#EBF8FF', borderColor: '#BEE3F8' },
  infoText: { fontSize: 14, color: '#2D3748' },
  infoSubtext: { fontSize: 11, color: '#718096', marginTop: 2 },
  bold: { fontWeight: 'bold', color: colors.primary },
  footer: { flexDirection: 'row', marginTop: 30, gap: 12 },
  btnSalvar: { 
    flex: 1, 
    height: 55, 
    backgroundColor: colors.primary, 
    borderRadius: borderRadius.md, 
    justifyContent: 'center', 
    alignItems: 'center',
    elevation: 2
  },
  btnText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
  btnExcluir: { 
    width: 55, 
    height: 55, 
    borderRadius: borderRadius.md, 
    borderWidth: 1.5, 
    borderColor: '#FF5252', 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
});