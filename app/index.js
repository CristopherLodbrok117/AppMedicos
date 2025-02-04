import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';

export default function App() {
  return (
    <View style={styles.container}>
      {/* Contenido principal */}
      <View style={styles.mainContent}>
        <Text style={styles.title}>Bienvenidos a la app para paramédicos</Text>
        <Text style={styles.description}>
          Aquí podrás gestionar tus herramientas y recursos.
        </Text>
      </View>
      
      {/* <StatusBar style="auto" /> */}
    </View>
  );
}

const styles = StyleSheet.create({
    container: {
      flex: 1, // Ocupa toda la pantalla
      flexDirection: 'row', // Dividir en filas (barra lateral + contenido)
      backgroundColor: '#f5f5f5',
    },
    mainContent: {
      flex: 1, // Toma el espacio restante después de la barra
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
      backgroundColor: '#fff',
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      color: '#333',
      marginBottom: 10,
    },
    description: {
      fontSize: 16,
      textAlign: 'center',
      color: '#666',
    },
  });