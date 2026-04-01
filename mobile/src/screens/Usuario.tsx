import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Platform, StatusBar, Alert, Modal, ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Importações dos seus serviços, temas e componentes
import { usuarioAtual } from '../services/auth';
import { supabase } from '../services/supabase';
import FloatingInput from '../components/FloatingInput';
import { colors, borderRadius, spacing, shadows } from '../theme';
import { formataDados } from '../lib/formataDados';
import { sanitizarRegistro } from '../lib/sanitizaDados';

const OPCOES_SEXO = ['M', 'F', 'Outro', 'Prefiro não dizer'];

export default function Usuario({ navigation }: any) {
  const [loading, setLoading] = useState(true);
  const [editando, setEditando] = useState(false);
  const [dropdownSexo, setDropdownSexo] = useState(false);

  // Estados dos dados (Sincronizados com seu SQL do Supabase/SQLite)
  const [usuariouuid, setUsuariouuid] = useState('');
  const [nomecompleto, setNomecompleto] = useState('');
  const [email, setEmail] = useState('');
  const [celular, setCelular] = useState('');
  const [plano, setPlano] = useState('Free'); 
  const [datavencimento, setDatavencimento] = useState('');
  const [cpf, setCpf] = useState('');
  const [sexo, setSexo] = useState('');
  const [datanascimento, setDatanascimento] = useState('');

  // Carregar dados ao iniciar a tela
  useEffect(() => {
    carregarPerfil();
  }, []);

  const carregarPerfil = async () => {
    try {
      setLoading(true);
      
      // 1. Obtém o usuário da sessão (Auth)
      const user = await usuarioAtual();
      
      if (!user) {
        Alert.alert('Erro', 'Sessão não encontrada. Por favor, faça login novamente.');
        navigation.navigate('Login');
        return;
      }

      // IMPORTANTE: Guardamos os campos que o banco exige como NOT NULL
      setUsuariouuid(user.id);
      setEmail(user.email ?? '');

      // 2. Busca dados na tabela 'usuarios' do Supabase
      const { data: perfil, error: dbError } = await supabase
        .from('usuarios')
        .select('*, planos(nome)')
        .eq('usuariouuid', user.id)
        .single();

      // PGRST116 significa que o registro ainda não existe na tabela usuarios
      if (dbError && dbError.code !== 'PGRST116') throw dbError;

      if (perfil) {
        setNomecompleto(perfil.nomecompleto || '');
        setCelular(perfil.celular || '');
        setDatavencimento(perfil.datavencimento || '');
        setCpf(perfil.cpf || '');
        setSexo(perfil.sexo || '');
        setDatanascimento(perfil.datanascimento || '');
        
        if (perfil.planos?.nome) {
          setPlano(perfil.planos.nome);
        }
      }

    } catch (error: any) {
      console.error('[Usuario] Erro ao carregar:', error.message);
      Alert.alert('Erro', 'Não foi possível carregar os dados do perfil.');
    } finally {
      setLoading(false);
    }
  };

  const handleSalvar = async () => {
  // TRAVA DE SEGURANÇA: Se os campos obrigatórios estiverem vazios, cancela.
  if (!usuariouuid || !email) {
    Alert.alert('Erro', 'Dados de autenticação não carregados. Tente novamente em instantes.');
    carregarPerfil(); // Tenta recarregar
    return;
  }

  const { valido, dados, erros } = sanitizarRegistro('usuarios', {
    nomecompleto,
    celular,
    cpf,
    sexo,
    datanascimento,
  });

  if (!valido) {
    Alert.alert('Dados inválidos', erros.join('\n'));
    return;
  }

  try {
    setLoading(true);

    // Objeto que será enviado ao banco
    const payload = {
      usuariouuid: usuariouuid, // Chave primária
      email: email,             // NOT NULL
      nomecompleto: nomecompleto, // NOT NULL
      ...dados,
      atualizado_em: new Date().toISOString()
    };

    console.log('[Usuario] Enviando Upsert:', payload);

    const { error } = await supabase
      .from('usuarios')
      .upsert(payload, { onConflict: 'usuariouuid' }); // Força o conflito na chave certa

    if (error) throw error;

    setEditando(false);
    Alert.alert('Sucesso', 'Perfil atualizado com sucesso!');
  } catch (error: any) {
    console.error('[Usuario] Erro detalhado:', error);
    Alert.alert('Erro do Banco', error.message);
  } finally {
    setLoading(false);
  }
};

  const handleCancelar = () => {
    setEditando(false);
    carregarPerfil(); // Reverte para os dados salvos no banco
  };

  if (loading && !editando) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{ marginTop: 10, color: colors.textMuted }}>Buscando dados...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* AppBar Customizada */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerButton}>
          <Ionicons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Meu Perfil</Text>
        <TouchableOpacity 
          onPress={() => setEditando(!editando)} 
          style={styles.headerButton}
        >
          <Ionicons name={editando ? 'close' : 'pencil-outline'} size={22} color="#FFF" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        
        {/* Header de Identificação */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarCircle}>
            <Ionicons name="person" size={50} color={colors.primary} />
          </View>
          <View style={styles.badgePlano}>
            <Text style={styles.badgeText}>{plano.toUpperCase()}</Text>
          </View>
        </View>

        {/* Card de Formulário */}
        <View style={styles.formularioCard}>
          
          <FloatingInput
            label="Nome Completo"
            value={nomecompleto}
            onChangeText={(v: string) => setNomecompleto(v)}
            editable={editando}
          />

          <View style={styles.inputReadOnly}>
            <Text style={styles.labelReadOnly}>E-mail da Conta</Text>
            <Text style={styles.valorReadOnly}>{email || 'Carregando...'}</Text>
          </View>

          <FloatingInput
            label="Celular"
            value={celular}
            onChangeText={(v: string) => setCelular(formataDados(v, 'celular'))}
            keyboardType="phone-pad"
            editable={editando}
          />

          <FloatingInput
            label="CPF"
            value={cpf}
            onChangeText={(v: string) => setCpf(formataDados(v, 'cpf'))}
            keyboardType="numeric"
            editable={editando}
          />

          <View style={styles.dropdownContainer}>
            <Text style={styles.dropdownLabel}>Gênero / Sexo</Text>
            <TouchableOpacity
              style={[styles.dropdownTrigger, !editando && styles.dropdownDisabled]}
              onPress={() => editando && setDropdownSexo(true)}
            >
              <Text style={styles.dropdownValueText}>{sexo || 'Não informado'}</Text>
              {editando && <Ionicons name="chevron-down" size={18} color={colors.primary} />}
            </TouchableOpacity>
          </View>

          <FloatingInput
            label="Data de Nascimento"
            value={datanascimento}
            onChangeText={(v: string) => setDatanascimento(formataDados(v, 'data'))}
            keyboardType="numeric"
            editable={editando}
          />

        </View>

        {/* Ações de Edição */}
        {editando && (
          <View style={styles.areaBotoes}>
            <TouchableOpacity style={styles.btnCancelar} onPress={handleCancelar}>
              <Text style={styles.txtBtnCancelar}>Descartar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.btnSalvar} onPress={handleSalvar}>
              <Text style={styles.txtBtnSalvar}>Salvar Alterações</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Modal para Seleção de Sexo */}
      <Modal transparent visible={dropdownSexo} animationType="fade">
        <TouchableOpacity 
          style={styles.modalBackdrop} 
          onPress={() => setDropdownSexo(false)}
        >
          <View style={styles.modalInner}>
            <Text style={styles.modalHeaderTitle}>Selecione o Gênero</Text>
            {OPCOES_SEXO.map((item) => (
              <TouchableOpacity
                key={item}
                style={[styles.opcaoItem, sexo === item && styles.opcaoAtiva]}
                onPress={() => { setSexo(item); setDropdownSexo(false); }}
              >
                <Text style={[styles.opcaoTexto, sexo === item && styles.opcaoTextoAtivo]}>
                  {item === 'M' ? 'Masculino' : item === 'F' ? 'Feminino' : item}
                </Text>
                {sexo === item && <Ionicons name="checkmark-circle" size={20} color={colors.primary} />}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
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
  headerButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  content: { padding: spacing.lg },
  avatarSection: { alignItems: 'center', marginBottom: spacing.xl },
  avatarCircle: {
    width: 90, height: 90, borderRadius: 45,
    backgroundColor: '#E8F8F1',
    justifyContent: 'center', alignItems: 'center',
    ...shadows.card,
  },
  badgePlano: {
    marginTop: -15,
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
    borderWidth: 2,
    borderColor: '#FFF',
  },
  badgeText: { color: '#FFF', fontSize: 11, fontWeight: 'bold' },
  formularioCard: {
    backgroundColor: '#FFF',
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    ...shadows.card,
  },
  inputReadOnly: { marginBottom: spacing.md, borderBottomWidth: 1, borderBottomColor: '#F0F0F0', paddingBottom: 8 },
  labelReadOnly: { fontSize: 12, color: colors.primary, fontWeight: '600' },
  valorReadOnly: { fontSize: 15, color: '#777', marginTop: 4 },
  dropdownContainer: { marginBottom: spacing.md, marginTop: spacing.sm },
  dropdownLabel: { fontSize: 12, color: colors.primary, fontWeight: '600', marginBottom: 6 },
  dropdownTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1.5,
    borderBottomColor: colors.primaryLight,
    paddingBottom: 8,
  },
  dropdownDisabled: { borderBottomColor: '#EEE' },
  dropdownValueText: { fontSize: 15, color: colors.text },
  areaBotoes: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.xl },
  btnCancelar: { flex: 1, height: 50, borderRadius: borderRadius.md, borderWidth: 1.5, borderColor: colors.primary, justifyContent: 'center', alignItems: 'center' },
  txtBtnCancelar: { color: colors.primary, fontWeight: 'bold' },
  btnSalvar: { flex: 1, height: 50, borderRadius: borderRadius.md, backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center', ...shadows.card },
  txtBtnSalvar: { color: '#FFF', fontWeight: 'bold' },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalInner: { backgroundColor: '#FFF', borderRadius: borderRadius.lg, padding: spacing.xl, width: '85%' },
  modalHeaderTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: spacing.lg, textAlign: 'center', color: colors.text },
  opcaoItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 14, borderBottomWidth: 0.5, borderBottomColor: '#F0F0F0' },
  opcaoAtiva: { backgroundColor: '#F0FBF6', borderRadius: borderRadius.sm, paddingHorizontal: 10 },
  opcaoTexto: { fontSize: 16, color: colors.text },
  opcaoTextoAtivo: { color: colors.primary, fontWeight: 'bold' },
});