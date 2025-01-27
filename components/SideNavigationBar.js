import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Pressable } from 'react-native';

const SideNavigationBar = () => {
  return (
    <View style={styles.sidebar}>
      {Array.from({ length: 6 }).map((_, index) => (
        <TouchableOpacity  key={index} style={styles.button}>
          <Text style={styles.buttonText}>Botón {index + 1}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  sidebar: {
    width: 90, // Ancho de la barra lateral
    flexDirection: 'column', // Botones en columna
    justifyContent: 'space-around', // Espaciado uniforme
    alignItems: 'center',
    justifyContent: 'space-evenly',
    backgroundColor: '#20b2aa', // Verde azulado
    paddingVertical: 20,
    elevation: 3, // Sombra en Android
    shadowColor: '#000', // Sombra en iOS
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  button: {
    width: '80%',
    paddingVertical: 10,
    backgroundColor: '#fff2',
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
});

export default SideNavigationBar;
