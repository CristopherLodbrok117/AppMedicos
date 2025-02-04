import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const TopNavigationBar = () => {
  return (
    <View style={styles.navbar}>
      {Array.from({ length: 6 }).map((_, index) => (
        <TouchableOpacity key={index} style={styles.button}>
          <Text style={styles.buttonText}>Botón {index + 1}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  navbar: {
    flexDirection: 'row', // Alinear los botones horizontalmente
    justifyContent: 'space-between', // Espacio entre los botones
    alignItems: 'center',
    backgroundColor: '#20b2aa', // Verde azulado
    paddingHorizontal: 10,
    paddingVertical: 15,
    elevation: 3, // Sombra en Android
    shadowColor: '#000', // Sombra en iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: '#fff',
    borderRadius: 8,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
});

export default TopNavigationBar;
