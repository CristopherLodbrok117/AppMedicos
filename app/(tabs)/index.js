
import React from 'react';
import { StyleSheet, Text, View, ImageBackground, TouchableOpacity } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import CustomButton from '../components/CustomButton';
import { useRouter } from 'expo-router';
import { Alert } from 'react-native';
import useCreateRecord from '../hooks/useCreateRecord';

export default function App() {
  const router = useRouter();

  const { createRecord, isLoading, error } = useCreateRecord();

  const handleCreate = async () => {
    try {
      await createRecord(); // Usa el valor por defecto { id: 1 }
    } catch {
      Alert.alert(
        'Error', 
        error || 'No se pudo crear el registro médico',
        [{ text: 'OK', onPress: () => {} }]
      );
    }
  };

  return (
    <View style={styles.container}>
      {/* Imagen de fondo */}
      <ImageBackground
        source={require('../assets/image-paramedicos.jpg')} // Asegúrate de tener una imagen aquí
        style={styles.background}
        resizeMode="cover"
      >
        {/* Capa de oscurecimiento */}
        <View style={styles.overlay} />

        {/* Contenido encima */}
        <View style={styles.content}>
          <Text style={styles.title}>Paramédicos CUCEI</Text>

          {/* Panel de botones */}
          <View style={styles.panel}>
            <CustomButton
              title="" // Texto vacío
              onPress={handleCreate}
              backgroundColor="#20b2aa"
              disabled={isLoading}
              icon={isLoading ? "autorenew" : "add"}
              iconColor="white"
              iconSize={80}
              padding={0}
              style={styles.iconButton}
              borderRadius={60}
              minWidth={120}
              minHeight={120}
            />

            <CustomButton
              title="Historial"
              onPress={() => router.push('/(tabs)/protocolos')}
              backgroundColor="#343434"
              fontSize={18}
              padding={15}
              minWidth={200}
            />
            <CustomButton
              title="Pendientes"
              onPress={() => router.push('/(tabs)/recursos')}
              backgroundColor="#787878"
              fontSize={18}
              padding={15}
              minWidth={200}
            />
          </View>
        </View>
      </ImageBackground>

      {/* Barra de estado */}
      <StatusBar style="dark" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
    justifyContent: 'center',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject, // Ocupa todo el espacio
    backgroundColor: 'rgba(0, 160, 0, 0.1)', // Negro con 40% de opacidad
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 40,
    color: 'white',
    fontWeight: 'bold',
    marginTop: 170,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingVertical: 15,
    paddingHorizontal: 15,
    borderRadius: 30,
    textAlign: 'center',
  },
  panel: {
    width: '50%',
    
    backgroundColor: 'rgba(255, 255, 255, 0.9)', // Blanco semitransparente
    borderRadius: 20,
    borderWidth: 4,
    borderColor: 'rgba(0, 0, 0, 0.5)',
    padding: 20,
    marginTop: 'auto', // Empuja el panel hacia abajo
    marginBottom: 40, // Separación del borde inferior
    alignItems: 'center',
  },
  button: {
    backgroundColor: '#007BFF',
    width: '100%',
    paddingVertical: 15,
    borderRadius: 10,
    marginBottom: 15,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
