import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, Image, StyleSheet,
  Platform, Modal, TouchableWithoutFeedback, StatusBar
} from 'react-native';

interface AppBarProps {
  onMenuPress: () => void;
  navigation: any;
  title?: string;
}

export default function AppBar({ onMenuPress, navigation, title = 'Conta Mobi' }: AppBarProps) {
  const [menuVisible, setMenuVisible] = useState(false);

  const navigate = (screen: string) => {
    setMenuVisible(false);
    navigation.navigate(screen); // TODO: criar telas Usuario, Sobre, Ajuda
  };

  const statusBarHeight = Platform.OS === 'android' ? (StatusBar.currentHeight ?? 24) : 44;

  return (
    <View style={[styles.container, { paddingTop: statusBarHeight }]}>
      {/* Ícone Menu Sanduíche */}
      <TouchableOpacity onPress={onMenuPress} style={styles.iconButton}>
        <View style={styles.hamburger}>
          <View style={styles.line} />
          <View style={styles.line} />
          <View style={styles.line} />
        </View>
      </TouchableOpacity>

      {/* Título centralizado */}
      <Text style={styles.title}>{title}</Text>

      {/* Ícone Configurações */}
      <TouchableOpacity onPress={() => setMenuVisible(true)} style={styles.iconButton}>
        <Image source={require('../../assets/icons/configuracoes.png')} style={styles.icon} />
      </TouchableOpacity>

      {/* Dropdown Menu */}
      <Modal transparent visible={menuVisible} animationType="fade" onRequestClose={() => setMenuVisible(false)}>
        <TouchableWithoutFeedback onPress={() => setMenuVisible(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={[styles.dropdown, { top: statusBarHeight + 50 }]}>

                <TouchableOpacity style={styles.dropdownItem} onPress={() => navigate('Usuario')}>
                  <Image source={require('../../assets/icons/usuario.png')} style={styles.dropdownIcon} />
                  <Text style={styles.dropdownLabel}>Usuário</Text>
                </TouchableOpacity>

                <View style={styles.dropdownDivider} />

                <TouchableOpacity style={styles.dropdownItem} onPress={() => navigate('Sobre')}>
                  <Image source={require('../../assets/icons/sobre.png')} style={styles.dropdownIcon} />
                  <Text style={styles.dropdownLabel}>Sobre</Text>
                </TouchableOpacity>

                <View style={styles.dropdownDivider} />

                <TouchableOpacity style={styles.dropdownItem} onPress={() => navigate('Ajuda')}>
                  <Image source={require('../../assets/icons/ajuda.png')} style={styles.dropdownIcon} />
                  <Text style={styles.dropdownLabel}>Ajuda</Text>
                </TouchableOpacity>

              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#3EB489',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingBottom: 10,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  title: { color: '#FFF', fontSize: 18, fontWeight: 'bold', letterSpacing: 1 },
  iconButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  hamburger: { gap: 5 },
  line: { width: 24, height: 2.5, backgroundColor: '#FFF', borderRadius: 2 },
  icon: { width: 26, height: 26 },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  dropdown: {
    position: 'absolute',
    right: 10,
    backgroundColor: '#FFF',
    borderRadius: 12,
    paddingVertical: 5,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    minWidth: 160,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 15,
  },
  dropdownIcon: { width: 22, height: 22, marginRight: 12 },
  dropdownLabel: { fontSize: 14, color: '#333', fontWeight: '500' },
  dropdownDivider: { height: 0.5, backgroundColor: '#EEE', marginHorizontal: 10 },
});