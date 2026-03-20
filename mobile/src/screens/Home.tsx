import React from 'react';
import { StyleSheet, View, Text, ScrollView, Platform, Dimensions, TouchableOpacity } from 'react-native';
import { BarChart, PieChart } from "react-native-gifted-charts";
import { Ionicons } from '@expo/vector-icons';

const screenWidth = Dimensions.get("window").width;

export default function HomeScreen({ navigation }: any) {
  
  // Dados fictícios para o Gráfico Principal (Barras)
  const barData = [
    { value: 5000, label: 'Contas', frontColor: '#008552' },
    { value: 3000, label: 'Receber', frontColor: '#4CAF50' },
    { value: 2500, label: 'Pagar', frontColor: '#F44336' },
    { value: 1500, label: 'Cartões', frontColor: '#FF9800' },
    { value: 4000, label: 'Geral', frontColor: '#008552' }, // Lógica de cor automática depois
  ];

  // Dados fictícios para os Gráficos de Pizza
  const pieData = [
    { value: 40, color: '#008552', text: 'Itaú' },
    { value: 30, color: '#10B981', text: 'Nubank' },
    { value: 30, color: '#34D399', text: 'Inter' },
  ];

  return (
    <View style={styles.container}>
      {/* Header Personalizado */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.openDrawer()}>
          <Ionicons name="menu" size={30} color="#008552" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Conta Mobi</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Configuracoes')}>
          <Ionicons name="settings-outline" size={26} color="#008552" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* Bloco 1: Principal (Barras) */}
        <View style={styles.mainCard}>
          <Text style={styles.cardTitle}>Resumo Financeiro Geral</Text>
          <BarChart
            data={barData}
            barWidth={35}
            noOfSections={3}
            barBorderRadius={4}
            frontColor="#008552"
            yAxisThickness={0}
            xAxisThickness={0}
            hideRules
          />
        </View>

        {/* Grid de 4 blocos (Pizzas) */}
        <View style={styles.grid}>
          {/* Bloco 2: Contas Correntes */}
          <View style={styles.smallCard}>
            <Text style={styles.smallCardTitle}>Bancos</Text>
            <PieChart data={pieData} donut radius={40} innerRadius={25} centerLabelComponent={() => <Text style={{fontSize: 10}}>R$</Text>} />
          </View>

          {/* Bloco 3: Cartões */}
          <View style={styles.smallCard}>
            <Text style={styles.smallCardTitle}>Faturas</Text>
            <PieChart data={[{value: 70, color: '#F44336'}, {value: 30, color: '#EEE'}]} donut radius={40} />
          </View>

          {/* Bloco 4: A Receber (Semanas) */}
          <View style={styles.smallCard}>
            <Text style={styles.smallCardTitle}>A Receber</Text>
            <PieChart data={pieData} radius={40} />
          </View>

          {/* Bloco 5: A Pagar (Semanas) */}
          <View style={styles.smallCard}>
            <Text style={styles.smallCardTitle}>A Pagar</Text>
            <PieChart data={pieData} radius={40} />
          </View>
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F1FFFA' },
  header: {
    height: 60,
    backgroundColor: '#FFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    elevation: 4,
    marginTop: Platform.OS === 'android' ? 30 : 0
  },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#008552', letterSpacing: 1 },
  scrollContent: { padding: 15 },
  mainCard: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 15,
    elevation: 3,
    alignItems: 'center'
  },
  cardTitle: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 20 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  smallCard: {
    backgroundColor: '#FFF',
    width: '48%',
    borderRadius: 20,
    padding: 15,
    marginBottom: 15,
    elevation: 3,
    alignItems: 'center',
    height: 150
  },
  smallCardTitle: { fontSize: 12, fontWeight: 'bold', color: '#666', marginBottom: 10 }
});