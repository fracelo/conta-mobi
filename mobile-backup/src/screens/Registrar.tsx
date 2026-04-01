import React, { useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity, 
  Image, 
  KeyboardAvoidingView, 
  Platform,
  ScrollView,
  Alert,
  ActivityIndicator
} from 'react-native';
import FloatingInput from '../components/FloatingInput';
import { supabase } from '../services/supabase';

export default function Registrar({ navigation }: any) {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [carregando, setCarregando] = useState(false);

  const handleRegistro = async () => {
    // 1. Validações básicas (Usando Alertas com 3 argumentos fixos)
    if (!nome || !email || !senha || !confirmarSenha) {
      Alert.alert("Aviso", "Preencha todos os campos.", [{ text: "OK" }]);
      return;
    }

    if (senha !== confirmarSenha) {
      Alert.alert("Aviso", "As senhas não conferem.", [{ text: "OK" }]);
      return;
    }

    if (senha.length < 6) {
      Alert.alert("Aviso", "A senha deve ter no mínimo 6 caracteres.", [{ text: "OK" }]);
      return;
    }

    setCarregando(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password: senha,
        options: {
          data: {
            full_name: nome.trim(),
          }
        }
      });

      if (error) throw error;

      if (data.user) {
        // Alerta de Sucesso com os 3 argumentos exatos (Título, Mensagem, Botões)
        Alert.alert(
          "Sucesso!", 
          "Verifique seu e-mail para confirmar o cadastro.",
          [{ text: "OK", onPress: () => navigation.navigate('Login') }]
        );
      }

      if (error) throw error;

      if (data.user) {
        // Alerta corrigido para evitar erro de TurboModule no Android
        Alert.alert(
          "Sucesso!", 
          "Conta criada! Verifique seu e-mail para confirmar o cadastro.",
          [{ text: "Entendido", onPress: () => navigation.navigate('Login') }]
        );
      }

    } catch (error: any) {
      console.error("Erro no registro:", error.message);
      // Alerta de erro também simplificado
      Alert.alert("Erro no Cadastro", error.message);
    } finally {
      setCarregando(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContainer} 
        showsVerticalScrollIndicator={false}
      >
        
        <View style={styles.logoContainer}>
          <Image 
            source={require('../../assets/icons/icon.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.appName}>CONTA MOBI</Text>
        </View>

        <View style={styles.registerBox}>
          <Text style={styles.welcomeText}>Crie sua conta gratuita</Text>
          
          <FloatingInput 
            label="Nome Completo"
            value={nome}
            onChangeText={setNome}
            autoCapitalize="words"
          />

          <FloatingInput 
            label="E-mail"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <FloatingInput 
            label="Senha"
            value={senha}
            onChangeText={setSenha}
            secureTextEntry={true} 
          />

          <FloatingInput 
            label="Confirmar Senha"
            value={confirmarSenha}
            onChangeText={setConfirmarSenha}
            secureTextEntry={true}
          />

          <TouchableOpacity 
            style={[
              styles.button, 
              (!nome || !email || !senha || !confirmarSenha || carregando) && styles.buttonDisabled
            ]} 
            onPress={handleRegistro}
            disabled={!nome || !email || !senha || !confirmarSenha || carregando}
          >
            {carregando ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.buttonText}>CRIAR CONTA</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.loginLink}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.loginText}>
              Já tem uma conta? <Text style={styles.loginBold}>Entrar</Text>
            </Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F1FFFA', 
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 25,
    paddingBottom: 40,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logo: {
    width: 80,
    height: 80,
  },
  appName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#008552', 
    marginTop: 8,
    letterSpacing: 1.2,
  },
  registerBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 25,
    padding: 25,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  welcomeText: {
    fontSize: 15,
    color: '#666',
    marginBottom: 20, 
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#008552', 
    borderRadius: 15,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 25,
  },
  buttonDisabled: {
    backgroundColor: '#A5D6A7', 
  },
  buttonText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: 'bold',
  },
  loginLink: {
    marginTop: 20,
    alignItems: 'center',
  },
  loginText: {
    color: '#999',
    fontSize: 13,
  },
  loginBold: {
    color: '#008552',
    fontWeight: 'bold',
  },
});