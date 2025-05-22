// app/(tabs)/index.js
import React, { useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ImageBackground,
  Text,
  Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import CustomButton from '../components/CustomButton';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { getPendingRecords, setSessionRecordId } from '../../services/database';

export default function Home() {
  const router = useRouter();
  const [pending, setPending] = useState([]);

  useFocusEffect(useCallback(() => {
    getPendingRecords().then(setPending).catch(console.error);
  }, []));

  function handleAdd() {
    if (pending.length > 0) {
      Alert.alert(
        'Tienes un expediente pendiente',
        `ID: ${pending[0].id}\n¿Continuar o crear uno nuevo?`,
        [
          {
            text: 'Continuar',
            onPress: () =>
              router.push(`/MedicalRecordScreen?recordId=${pending[0].id}`),
          },
          {
            text: 'Nuevo',
            onPress: () => {
              // liberamos sesión y navegamos sin recordId
              setSessionRecordId(null);
              router.push('/MedicalRecordScreen');
            },
          },
          { text: 'Cancelar', style: 'cancel' },
        ]
      );
    } else {
      // liberamos sesión y navegamos
      setSessionRecordId(null);
      router.push('/MedicalRecordScreen');
    }
  }

  return (
    <View style={styles.container}>
      <ImageBackground
        source={require('../assets/image-paramedicos.jpg')}
        style={styles.background}
        resizeMode="cover"
      >
        <View style={styles.overlay} />
        <View style={styles.content}>
          <Text style={styles.title}>Paramédicos CUCEI</Text>
          <View style={styles.panel}>
            <CustomButton
              onPress={handleAdd}
              backgroundColor="#20b2aa"
              icon="add"
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
              onPress={() => router.push('/protocolos')}
              backgroundColor="#343434"
              fontSize={18}
              padding={15}
              minWidth={200}
            />
            <CustomButton
              title="Pendientes"
              onPress={() => router.push('/recursos')}
              backgroundColor="#787878"
              fontSize={18}
              padding={15}
              minWidth={200}
            />
          </View>
        </View>
      </ImageBackground>
      <StatusBar style="dark" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  background: { flex: 1, width: '100%', height: '100%', justifyContent: 'center' },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.1)' },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 },
  title: {
    fontSize: 40, color: 'white', fontWeight: 'bold',
    marginTop: 170, backgroundColor: 'rgba(0,0,0,0.5)',
    paddingVertical: 15, paddingHorizontal: 15, borderRadius: 30, textAlign: 'center',
  },
  panel: {
    width: '50%', backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 20, borderWidth: 4, borderColor: 'rgba(0,0,0,0.5)',
    padding: 20, marginTop: 'auto', marginBottom: 40, alignItems: 'center',
  },
  iconButton: { aspectRatio: 1, borderRadius: 50, alignSelf: 'center' },
});
