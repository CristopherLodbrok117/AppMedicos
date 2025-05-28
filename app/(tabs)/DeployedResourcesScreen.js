// app/(tabs)/DeployedResourcesScreen.js
import React, { useState, useEffect, useCallback } from 'react';
import { 
  ScrollView, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  Image, 
  Alert 
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';

import Resource from '../components/Resource';

import { 
  initDatabase, 
  insertRecord, 
  createAllStubs, 
  updateRecord, 
  updateDeployedResources, 
  getDeployedResourcesById, 
  getSessionRecordId, 
  setSessionRecordId 
} from '../../services/database';

// Etiquetas tal como aparecen al usuario
const AVAILABLE_RESOURCES = [
  'Agua inyectable 500ml','Agua oxigenada','Agujas 20x32','Algodón paquete',
  'Bata desechable','Bolsa negra','Bolsa roja','Bolsa amarilla','Bum free gel',
  'Campos estériles','Cánula blanda de aspiración','Cánulas nasofaringeas',
  'Cánulas orofaringeas','Cánula Yankawer','Catéter #12','Catéter #14',
  'Catéter #16','Catéter #18','Catéter #20','Catéter #22','Catéter #24',
  'Cinta Transporte 3m 1','Cinta Transporte 3m 2','Collarines desechables',
  'Cubrebocas','Desinfectante para manos','Desinfectante para superficies',
  'Fijador de TE adulto','Fijador de TE pediátrico','Gasas estériles',
  'Gasas no estériles'
];

// Pasa la etiqueta a nombre de columna: quita acentos, espacios → _
const toColumnName = label =>
  label
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, '')
    .trim()
    .replace(/\s+/g, '_');

export default function DeployedResourcesScreen() {
  const { recordId: rawParam } = useLocalSearchParams();
  const paramId = rawParam ? parseInt(rawParam, 10) : null;
  const router = useRouter();

  // 1) ID actual
  const [recordId, setRecordId] = useState(paramId || getSessionRecordId());
  // 2) { columna: cantidad, ... }
  const [quantities, setQuantities] = useState({});

  // Si venimos de “Nuevo” (sesión reiniciada), limpiamos
  const clearForm = () => {
    setQuantities({});
    setRecordId(null);
  };
  useFocusEffect(useCallback(() => {
    if (getSessionRecordId() === null) clearForm();
  }, []));

  // Al montar / cambiar paramId: init, stubs y carga
  useEffect(() => {
    (async () => {
      await initDatabase();
      const id = paramId || getSessionRecordId();
      if (!id) return;
      setRecordId(id);
      await createAllStubs(id);
      const row = await getDeployedResourcesById(id);
      if (row) {
        const { recordId: _, ...cols } = row;
        setQuantities(cols);
      }
    })();
  }, [paramId]);

  // Cuando cambias cantidad en un recurso
  const onResourceChange = (label, qty) => {
    const col = toColumnName(label);
    setQuantities(curr => ({ ...curr, [col]: qty }));
  };

  // Guardar / Terminar más tarde
  const onSave = async statusLabel => {
    let id = recordId;
    if (!id) {
      const now = new Date();
      id = await insertRecord({
        date: now.toISOString().slice(0,10),
        time: now.toTimeString().slice(0,8),
        weekDay:'', attentionReason:'', serviceLocation:'',
        vehicleType:'', vehicleNum:'', operator:'',
        intern:'', moreInterns:'', affiliation:'',
        gender:'', age:'', address:'', colony:'',
        municipality:'', phone:'', rightful:''
      }, statusLabel);
      await createAllStubs(id);
      setSessionRecordId(id);
      setRecordId(id);
    } else {
      await updateRecord(id, { status: statusLabel });
    }

    await updateDeployedResources(id, quantities);

    Alert.alert(
      statusLabel === 'saved' ? 'Guardado' : 'Pendiente',
      `Recursos ID ${id} → status: ${statusLabel}`,
      [{
        text: 'OK',
        onPress: () => {
          // <-- reemplazamos el push con objeto
          router.replace(`/DeployedResourcesScreen?recordId=${id}`);
        }
      }],
      { cancelable: false }
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.container} nestedScrollEnabled>
      <Text style={styles.title}>Recursos Utilizados</Text>
      <Image style={styles.image} source={require('../assets/doctor.png')} />
      <Text style={styles.subtitle}>Arrastra o elige cantidad</Text>

      {AVAILABLE_RESOURCES.map((label, i) => (
        <Resource
          key={i}
          name={label}
          quantity={quantities[toColumnName(label)] || 0}
          onQuantityChange={qty => onResourceChange(label, qty)}
        />
      ))}

      <TouchableOpacity
        style={styles.saveButton}
        onPress={() => onSave('saved')}
      >
        <Text style={styles.buttonText}>Guardar</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.pendingButton}
        onPress={() => onSave('pending')}
      >
        <Text style={styles.buttonText}>Terminar más tarde</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container:     { padding:20, alignItems:'center', backgroundColor:'#f5f5f5' },
  title:         { fontSize:24, fontWeight:'bold', marginBottom:10 },
  image:         { width:100, height:100, marginBottom:20, borderRadius:8 },
  subtitle:      { fontSize:18, fontWeight:'600', color:'#555', marginBottom:20 },
  saveButton:    { backgroundColor:'#28a745', padding:12, borderRadius:8, width:'100%', marginBottom:10 },
  pendingButton: { backgroundColor:'#6c757d', padding:12, borderRadius:8, width:'100%' },
  buttonText:    { color:'#fff', textAlign:'center', fontWeight:'bold' }
});
