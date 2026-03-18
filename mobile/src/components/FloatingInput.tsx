import React, { useState } from 'react';
import { View, TextInput, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function FloatingInput({ label, value, onChangeText, secureTextEntry, ...props }: any) {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <View style={styles.container}>
      <Text style={[
        styles.label,
        (isFocused || value) ? styles.labelFloating : styles.labelNormal
      ]}>
        {label}
      </Text>
      
      <View style={styles.inputWrapper}>
        <TextInput
          style={styles.input}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onChangeText={onChangeText}
          value={value}
          placeholder={!isFocused && !value ? label : ""} // Placeholder aparece se vazio
          secureTextEntry={secureTextEntry && !showPassword}
          underlineColorAndroid="transparent"
          {...props}
        />
        
        {secureTextEntry && (
          <TouchableOpacity 
            onPress={() => setShowPassword(!showPassword)}
            style={styles.icon}
          >
            <Ionicons 
              name={showPassword ? "eye-outline" : "eye-off-outline"} 
              size={20} 
              color="#008552" 
            />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 15,
    marginBottom: 10,
  },
  label: {
    position: 'absolute',
    left: 10,
    color: '#008552',
    fontWeight: '500',
  },
  labelNormal: {
    top: 30,
    fontSize: 14,
    opacity: 0, 
  },
  labelFloating: {
    top: -2,
    fontSize: 12,
    opacity: 1,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1.5,
    borderBottomColor: '#3EB489',
    height: 45, // Aumentamos um pouco a altura para o texto caber
  },
  input: {
    flex: 1,
    height: '100%',
    fontSize: 15, // Diminuímos levemente a fonte (era 16)
    color: '#333',
    paddingLeft: 5,
    paddingBottom: 0, // Garante que o texto não suba
    textAlignVertical: 'center', // Centraliza no Android
  },
  icon: {
    padding: 10,
  }
});