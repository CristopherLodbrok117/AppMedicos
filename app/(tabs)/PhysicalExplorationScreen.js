// app/(tabs)/PhysicalExplorationScreen.js
import React, { useState, useEffect, useCallback } from 'react';
import {
  ScrollView,
  View,
  Text,
  Image,
  TouchableOpacity,
  Modal,
  Pressable,
  StyleSheet,
  Alert
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';

import CheckListV1 from '../components/CheckListV1';
import IconImageV1 from '../components/IconImageV1';

import {
  initDatabase,
  insertRecord,
  createAllStubs,
  updateRecord,
  updatePhysicalExploration,
  getPhysicalExplorationById,
  getRecordById,            // ← para leer status y bloquear edición
  getSessionRecordId,
  setSessionRecordId
} from '../../services/database';

const INJURIES = [
  "Deformidades (D)",
  "Contusiones (CD)",
  "Abrasiones (A)",
  "Penetraciones (P)",
  "Movimiento paradóudico (MP)",
  "Crepitación (C)",
  "Heridas (H)",
  "Fracturas (P)",
  "Émﬁsema subcutáneo (ES)",
  "Quemaduras (Q)",
  "Laceraciones (L)",
  "Edema (E)",
  "Alteración de sensibilidad (AS)",
  "Alteración de movilidad (AM)",
  "Dolor (DO)",
];

export default function PhysicalExplorationScreen() {
  const { recordId: rawParam } = useLocalSearchParams();
  const paramId = rawParam ? parseInt(rawParam, 10) : null;
  const router = useRouter();

  // ID de la sesión o del parámetro
  const [recordId, setRecordId] = useState(paramId || getSessionRecordId());
  const [selectedInjuries, setSelectedInjuries] = useState([]);
  const [showInjuries, setShowInjuries] = useState(false);

  // Estado del expediente (para bloqueo de edición)
  const [status, setStatus] = useState('pending');
  const isLocked = status === 'saved';

  // Vacía formulario y sesión local
  const clearForm = () => {
    setSelectedInjuries([]);
    setShowInjuries(false);
    setRecordId(null);
    setStatus('pending');
  };

  // 1) Si pulsaste “Nuevo” en Home, clearForm()
  useFocusEffect(useCallback(() => {
    if (getSessionRecordId() === null) {
      clearForm();
    }
  }, []));

  // 2) Inicializa BD, reserva stubs y carga datos previos + status
  useEffect(() => {
    (async () => {
      await initDatabase();
      const id = paramId || getSessionRecordId();
      if (!id) return;
      setRecordId(id);
      await createAllStubs(id);

      // Lee status para saber si está finalizado
      const rec = await getRecordById(id);
      if (rec && rec.status) setStatus(rec.status);

      const prev = await getPhysicalExplorationById(id);
      if (prev && prev.injuries) {
        try {
          setSelectedInjuries(JSON.parse(prev.injuries));
        } catch {
          setSelectedInjuries([]);
        }
      }
    })();
  }, [paramId]);

  // 3) Guardar como borrador y avanzar (botón Siguiente)
  const handleNext = async () => {
    if (isLocked) {
      Alert.alert('Expediente finalizado', 'Este expediente ya está firmado y no puede editarse.');
      return;
    }

    let id = recordId;
    if (!id) {
      // crear padre si no existe
      const now = new Date();
      id = await insertRecord({
        date: now.toISOString().slice(0,10),
        time: now.toTimeString().slice(0,8),
        weekDay:'', attentionReason:'', serviceLocation:'',
        vehicleType:'', vehicleNum:'', operator:'',
        intern:'', moreInterns:'', affiliation:'',
        gender:'', age:'', address:'', colony:'',
        municipality:'', phone:'', rightful:''
      }, 'pending');
      await createAllStubs(id);
      setSessionRecordId(id);
      setRecordId(id);
    } else {
      await updateRecord(id, { status: 'pending' }); // ← BORRADOR
      setStatus('pending');
    }

    // actualizar lesiones
    await updatePhysicalExploration(id, {
      injuries: JSON.stringify(selectedInjuries)
    });

    Alert.alert('Guardado', `Exploración física ID ${id} → borrador`);
    // Navega al siguiente paso (ajusta si tu siguiente screen es otra)
    router.push({ pathname: '/PatientConditionScreen', params: { recordId: id } });
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Exploración Física</Text>
      <Text style={styles.subtitle}>Expediente médico</Text>

      <Image
        style={styles.image}
        source={require('../assets/doctor.png')}
      />

      <TouchableOpacity
        style={styles.expandButton}
        onPress={() => { if (!isLocked) setShowInjuries(!showInjuries); }}
        disabled={isLocked}
      >
        <Text style={styles.buttonText}>
          {showInjuries ? 'Cerrar' : 'Elegir tipo de lesión'}
        </Text>
      </TouchableOpacity>

      {showInjuries && (
        <View style={styles.expandableArea}>
          {/* espacio para tu UI si necesitas */}
        </View>
      )}

      <Modal visible={showInjuries} animationType="slide" transparent onRequestClose={() => setShowInjuries(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Tipo de lesión</Text>
            <View style={styles.areaArea}>
              <CheckListV1
                items={INJURIES}
                selectedItems={selectedInjuries}
                setSelectedItems={(arr) => {
                  if (isLocked) return;     // ← no permitir cambios si está finalizado
                  setSelectedInjuries(arr);
                }}
              />
            </View>
            <Pressable
              onPress={() => setShowInjuries(false)}
              style={styles.closeButton}
            >
              <Text style={styles.buttonText}>Cerrar</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <View style={styles.imageArea}>
        <Text style={styles.subtitle}>Zona de lesión</Text>
        {/* No tocamos tu componente; solo se bloquea la edición por status en la UI de la lista/abrir modal */}
        <IconImageV1 />
      </View>

      {/* Botón único: Siguiente (solo si NO está finalizado) */}
      {!isLocked && (
        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleNext}
        >
          <Text style={styles.buttonText}>Siguiente</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: 'f5f5f5',
  },
  title: {
    fontSize: 24, fontWeight: 'bold', marginBottom: 10,
  },
  subtitle: {
    fontSize: 18, fontWeight: '600', color: '#555',
    marginTop: 10, marginBottom: 20, alignSelf: 'center',
  },
  image: {
    width: 100, height: 100, marginBottom: 20,
    borderRadius: 8, resizeMode: 'cover', alignSelf: 'center',
  },
  expandButton: {
    backgroundColor: '#007bff', padding: 10,
    borderRadius: 8, marginBottom: 10,
  },
  buttonText: {
    color: 'white', textAlign: 'center',
    fontWeight: 'bold', fontSize: 18,
  },
  expandableArea: {
    width: '100%', height: 500,
    backgroundColor: '#e6e6e6', marginBottom: 10,
  },
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center', alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white', padding: 20,
    borderRadius: 15, width: '90%', alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18, fontWeight: 'bold', marginBottom: 10,
  },
  areaArea: {
    width: '100%', height: 450,
  },
  closeButton: {
    marginTop: 20, backgroundColor: '#007bff',
    padding: 10, borderRadius: 8,
  },
  imageArea: {
    width: 500, height: 450, backgroundColor: '#fff',
  },
  saveButton: {
    backgroundColor: '#28a745', padding: 10,
    borderRadius: 8, marginTop: 20, width: '100%',
  },
});
