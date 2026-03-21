import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Platform, StatusBar, Alert, Modal
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import FloatingInput from '../components/FloatingInput';
import { colors, borderRadius, spacing, shadows } from '../theme';
import { formataDados } from '../lib/formataDados';
import { sanitizarRegistro } from '../lib/sanitizaDados';

const OPCOES_SEXO = ['M', 'F', 'Outro', 'Prefiro não dizer'];

export default function Usuario({ navigation }: any) {
  const [editando, setEditando] = useState(false);
  const [dropdownSexo, setDropdownSexo] = useState(false);

  // Dados do usuário — TODO: carregar do SQLite
  const [nomecompleto, setNomecompleto] = useState('');
  const [email, setEmail] = useState('');
  const [celular, setCelular] = useState('');
  const [plano, setPlano] = useState('Free');
  const [datavencimento, setDatavencimento] = useState('');
  const [cpf, setCpf] = useState('');
  const [sexo, setSexo] = useState('');
  const [datanascimento, setDatanascimento] = useState('');

  const handleCancelar = () => {
    setEditando(false);
    // TODO: recarregar dados originais do SQLite
  };

  const handleSalvar = () => {
    const { valido, dados, erros } = sanitizarRegistro('usuarios', {
      nomecompleto,
      email,
      celular,
      cpf,
      sexo,
      datanascimento,
    });

    if (!valido) {
      Alert.alert('Dados inválidos', erros.join('\n'));
      return;
    }

    // TODO: salvar no SQLite e gravar log de sincronismo
    console.log('[Usuario] Dados sanitizados:', dados);
    setEditando(false);
    Alert.alert('Sucesso', 'Dados atualizados com sucesso!');
  };

  const isPlanoPago = plano !== 'Free';

  return (
    <View style={styles.container}>

      {/* AppBar */}
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

        {/* Avatar */}
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={50} color={colors.primary} />
          </View>
          <View style={styles.planoBadge}>
            <Text style={styles.planoBadgeText}>{plano}</Text>
          </View>
        </View>

        {/* Card de dados */}
        <View style={styles.card}>

          {/* Nome Completo */}
          <FloatingInput
            label="Nome Completo"
            value={nomecompleto}
            onChangeText={setNomecompleto}
            editable={editando}
          />

          {/* E-mail (não editável) */}
          <View style={styles.campoReadonly}>
            <Text style={styles.labelReadonly}>E-mail</Text>
            <Text style={styles.valorReadonly}>{email || '—'}</Text>
            <Text style={styles.infoReadonly}>O e-mail não pode ser alterado</Text>
          </View>

          {/* Celular */}
          <FloatingInput
            label="Celular"
            value={celular}
            onChangeText={(v: string) => setCelular(formataDados(v, 'celular'))}
            keyboardType="phone-pad"
            editable={editando}
          />

          {/* Plano */}
          <View style={styles.campoReadonly}>
            <Text style={styles.labelReadonly}>Plano</Text>
            <View style={styles.planoRow}>
              <Text style={styles.valorReadonly}>{plano}</Text>
              <TouchableOpacity style={styles.trocarPlanoBtn}>
                <Text style={styles.trocarPlanoText}>Trocar plano</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Data de Vencimento — só plano pago */}
          {isPlanoPago && (
            <View style={styles.campoReadonly}>
              <Text style={styles.labelReadonly}>Vencimento</Text>
              <Text style={styles.valorReadonly}>
                {datavencimento ? formataDados(datavencimento, 'data') : '—'}
              </Text>
            </View>
          )}

          {/* CPF — só plano pago */}
          {isPlanoPago && (
            <FloatingInput
              label="CPF"
              value={cpf}
              onChangeText={(v: string) => setCpf(formataDados(v, 'cpf'))}
              keyboardType="numeric"
              editable={editando}
            />
          )}

          {/* Sexo — Dropdown */}
          <View style={styles.campoDropdown}>
            <Text style={styles.labelDropdown}>Sexo</Text>
            <TouchableOpacity
              style={[styles.dropdown, !editando && styles.dropdownDisabled]}
              onPress={() => editando && setDropdownSexo(true)}
            >
              <Text style={styles.dropdownValor}>{sexo || 'Selecione...'}</Text>
              {editando && <Ionicons name="chevron-down" size={18} color={colors.primary} />}
            </TouchableOpacity>
          </View>

          {/* Data de Nascimento */}
          <FloatingInput
            label="Data de Nascimento (DD/MM/AAAA)"
            value={datanascimento}
            onChangeText={(v: string) => setDatanascimento(formataDados(v, 'data'))}
            keyboardType="numeric"
            editable={editando}
          />

          {/* Link Alterar Senha */}
          <TouchableOpacity
            style={styles.alterarSenhaLink}
            onPress={() => navigation.navigate('AlterarSenha')} // TODO: tela AlterarSenha
          >
            <Ionicons name="lock-closed-outline" size={16} color={colors.primary} />
            <Text style={styles.alterarSenhaText}>Alterar senha</Text>
          </TouchableOpacity>

        </View>

        {/* Botões */}
        {editando && (
          <View style={styles.botoesContainer}>
            <TouchableOpacity style={styles.botaoCancelar} onPress={handleCancelar}>
              <Text style={styles.botaoCancelarText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.botaoSalvar} onPress={handleSalvar}>
              <Text style={styles.botaoSalvarText}>Salvar</Text>
            </TouchableOpacity>
          </View>
        )}

      </ScrollView>

      {/* Modal Dropdown Sexo */}
      <Modal
        transparent
        visible={dropdownSexo}
        animationType="fade"
        onRequestClose={() => setDropdownSexo(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          onPress={() => setDropdownSexo(false)}
          activeOpacity={1}
        >
          <View style={styles.modalCard}>
            <Text style={styles.modalTitulo}>Selecione o Sexo</Text>
            {OPCOES_SEXO.map((opcao) => (
              <TouchableOpacity
                key={opcao}
                style={[styles.modalOpcao, sexo === opcao && styles.modalOpcaoSelecionada]}
                onPress={() => { setSexo(opcao); setDropdownSexo(false); }}
              >
                <Text style={[styles.modalOpcaoText, sexo === opcao && styles.modalOpcaoTextSelecionado]}>
                  {opcao === 'M' ? 'Masculino' :
                   opcao === 'F' ? 'Feminino' : opcao}
                </Text>
                {sexo === opcao && <Ionicons name="checkmark" size={18} color={colors.primary} />}
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
  headerTitle: { color: '#FFF', fontSize: 18, fontWeight: 'bold', letterSpacing: 1 },
  headerButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  content: { padding: spacing.lg, paddingBottom: 40 },
  avatarContainer: { alignItems: 'center', marginBottom: spacing.lg },
  avatar: {
    width: 90, height: 90, borderRadius: 45,
    backgroundColor: '#E8F8F1',
    justifyContent: 'center', alignItems: 'center',
    ...shadows.card,
  },
  planoBadge: {
    marginTop: spacing.sm,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
  },
  planoBadgeText: { color: '#FFF', fontSize: 12, fontWeight: 'bold' },
  card: {
    backgroundColor: '#FFF',
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    ...shadows.card,
  },
  campoReadonly: { marginBottom: spacing.md, paddingTop: spacing.sm },
  labelReadonly: { fontSize: 12, color: colors.primary, fontWeight: '500', marginBottom: 4 },
  valorReadonly: { fontSize: 15, color: colors.text },
  infoReadonly: { fontSize: 11, color: colors.textMuted, marginTop: 2 },
  planoRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  trocarPlanoBtn: {
    backgroundColor: '#E8F8F1',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
  },
  trocarPlanoText: { color: colors.primary, fontSize: 12, fontWeight: 'bold' },
  campoDropdown: { marginBottom: spacing.md, paddingTop: spacing.sm },
  labelDropdown: { fontSize: 12, color: colors.primary, fontWeight: '500', marginBottom: 6 },
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1.5,
    borderBottomColor: colors.primaryLight,
    paddingBottom: 8,
    paddingHorizontal: 5,
  },
  dropdownDisabled: { borderBottomColor: '#DDD' },
  dropdownValor: { fontSize: 15, color: colors.text },
  alterarSenhaLink: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.lg,
    gap: 6,
  },
  alterarSenhaText: { color: colors.primary, fontSize: 13, fontWeight: '500' },
  botoesContainer: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  botaoCancelar: {
    flex: 1, height: 50,
    borderRadius: borderRadius.md,
    borderWidth: 1.5,
    borderColor: colors.primary,
    justifyContent: 'center', alignItems: 'center',
  },
  botaoCancelarText: { color: colors.primary, fontSize: 15, fontWeight: 'bold' },
  botaoSalvar: {
    flex: 1, height: 50,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primary,
    justifyContent: 'center', alignItems: 'center',
    ...shadows.card,
  },
  botaoSalvarText: { color: '#FFF', fontSize: 15, fontWeight: 'bold' },
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center', alignItems: 'center',
  },
  modalCard: {
    backgroundColor: '#FFF',
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    width: '80%',
    ...shadows.card,
  },
  modalTitulo: {
    fontSize: 16, fontWeight: 'bold',
    color: colors.text, marginBottom: spacing.md,
    textAlign: 'center',
  },
  modalOpcao: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: '#EEE',
  },
  modalOpcaoSelecionada: { backgroundColor: '#F0FBF6', borderRadius: borderRadius.sm },
  modalOpcaoText: { fontSize: 15, color: colors.text },
  modalOpcaoTextSelecionado: { color: colors.primary, fontWeight: 'bold' },
});