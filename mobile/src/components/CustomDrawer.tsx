import React, { useRef, useEffect, useState } from 'react';
import {
  View, Text, TouchableOpacity, Image, StyleSheet,
  ScrollView, Animated, Dimensions, TouchableWithoutFeedback
} from 'react-native';

const DRAWER_WIDTH = 280;

interface MenuItemProps {
  icon: any;
  label: string;
  onPress: () => void;
  indent?: boolean;
}

function MenuItem({ icon, label, onPress, indent = false }: MenuItemProps) {
  return (
    <TouchableOpacity style={[styles.menuItem, indent && styles.menuItemIndent]} onPress={onPress}>
      <Image source={icon} style={styles.menuIcon} />
      <Text style={[styles.menuLabel, indent && styles.menuLabelIndent]}>{label}</Text>
    </TouchableOpacity>
  );
}

function MenuSection({ icon, label, children }: { icon: any; label: string; children: React.ReactNode }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <>
      <TouchableOpacity style={styles.menuItem} onPress={() => setExpanded(!expanded)}>
        <Image source={icon} style={styles.menuIcon} />
        <Text style={styles.menuLabel}>{label}</Text>
        <Text style={styles.arrow}>{expanded ? '▲' : '▼'}</Text>
      </TouchableOpacity>
      {expanded && <View>{children}</View>}
    </>
  );
}

interface CustomDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  navigation: any;
}

export default function CustomDrawer({ isOpen, onClose, navigation }: CustomDrawerProps) {
  const translateX = useRef(new Animated.Value(-DRAWER_WIDTH)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setVisible(true);
      Animated.parallel([
        Animated.timing(translateX, { toValue: 0, duration: 250, useNativeDriver: true }),
        Animated.timing(overlayOpacity, { toValue: 0.5, duration: 250, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(translateX, { toValue: -DRAWER_WIDTH, duration: 200, useNativeDriver: true }),
        Animated.timing(overlayOpacity, { toValue: 0, duration: 200, useNativeDriver: true }),
      ]).start(() => setVisible(false));
    }
  }, [isOpen]);

  const navigate = (screen: string) => {
    onClose();
    navigation.navigate(screen);
  };

  if (!visible) return null;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents={isOpen ? 'auto' : 'none'}>
      {/* Overlay escuro */}
      <TouchableWithoutFeedback onPress={onClose}>
        <Animated.View style={[styles.overlay, { opacity: overlayOpacity }]} />
      </TouchableWithoutFeedback>

      {/* Drawer */}
      <Animated.View style={[styles.drawer, { transform: [{ translateX }] }]}>
        {/* Cabeçalho */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Conta Mobi</Text>
          <Text style={styles.headerSubtitle}>Menu Principal</Text>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          <MenuItem icon={require('../../assets/icons/home.png')} label="Home" onPress={() => navigate('Home')} />
          <MenuItem icon={require('../../assets/icons/categorias.png')} label="Categorias" onPress={() => navigate('Categorias')} />

          <MenuSection icon={require('../../assets/icons/ccorrentes.png')} label="Contas Correntes">
            <MenuItem icon={require('../../assets/icons/bancos.png')} label="Bancos" onPress={() => navigate('Bancos')} indent />
            <MenuItem icon={require('../../assets/icons/ccorrentes.png')} label="Contas" onPress={() => navigate('Contas')} indent />
          </MenuSection>

          <MenuSection icon={require('../../assets/icons/cartaocredito.png')} label="Cartões de Crédito">
            <MenuItem icon={require('../../assets/icons/bandeiras.png')} label="Bandeiras" onPress={() => navigate('Bandeiras')} indent />
            <MenuItem icon={require('../../assets/icons/cartaocredito.png')} label="Cartões" onPress={() => navigate('Cartoes')} indent />
          </MenuSection>

          <MenuSection icon={require('../../assets/icons/entidades.png')} label="Entidades">
            <MenuItem icon={require('../../assets/icons/cliente.png')} label="Clientes" onPress={() => navigate('Clientes')} indent />
            <MenuItem icon={require('../../assets/icons/fornecedor.png')} label="Fornecedores" onPress={() => navigate('Fornecedores')} indent />
          </MenuSection>

          <MenuSection icon={require('../../assets/icons/lancamentos.png')} label="Lançamentos">
            <MenuItem icon={require('../../assets/icons/lctobancarios.png')} label="Conta Corrente" onPress={() => navigate('LctoBancarios')} indent />
            <MenuItem icon={require('../../assets/icons/lctocartao.png')} label="Cartões de Crédito" onPress={() => navigate('LctoCartao')} indent />
            <MenuItem icon={require('../../assets/icons/lctoreceber.png')} label="A Receber" onPress={() => navigate('LctoReceber')} indent />
            <MenuItem icon={require('../../assets/icons/lctopagar.png')} label="A Pagar" onPress={() => navigate('LctoPagar')} indent />
          </MenuSection>

          <MenuItem icon={require('../../assets/icons/orcamento.png')} label="Orçamento" onPress={() => navigate('Orcamento')} />
          <MenuItem icon={require('../../assets/icons/fluxocaixa.png')} label="Fluxo de Caixa" onPress={() => navigate('FluxoCaixa')} />

          <View style={styles.divider} />

          <MenuItem icon={require('../../assets/icons/usuario.png')} label="Usuário" onPress={() => navigate('Usuario')} />
          <MenuItem icon={require('../../assets/icons/sobre.png')} label="Sobre" onPress={() => navigate('Sobre')} />
          <MenuItem icon={require('../../assets/icons/ajuda.png')} label="Ajuda" onPress={() => navigate('Ajuda')} />

          <View style={styles.divider} />

          <MenuItem
            icon={require('../../assets/icons/logout.png')}
            label="Logout"
            onPress={() => {
              onClose();
              navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
            }}
          />
        </ScrollView>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000',
  },
  drawer: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: DRAWER_WIDTH,
    backgroundColor: '#3EB489',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  header: {
    padding: 20,
    paddingTop: 50,
    backgroundColor: '#008552',
    marginBottom: 10,
  },
  headerTitle: { color: '#FFF', fontSize: 20, fontWeight: 'bold', letterSpacing: 1 },
  headerSubtitle: { color: '#B2DFCF', fontSize: 12, marginTop: 4 },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(255,255,255,0.2)',
  },
  menuItemIndent: {
    paddingLeft: 35,
    backgroundColor: 'rgba(0,0,0,0.08)',
  },
  menuIcon: { width: 48, height: 48, marginRight: 15 },
  menuLabel: { color: '#FFF', fontSize: 14, fontWeight: '500', flex: 1 },
  menuLabelIndent: { fontSize: 13, fontWeight: '400' },
  arrow: { color: '#FFF', fontSize: 10 },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.3)',
    marginVertical: 8,
    marginHorizontal: 20,
  },
});