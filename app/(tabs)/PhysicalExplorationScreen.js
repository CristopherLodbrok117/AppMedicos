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

  // Vacía formulario y sesión local
  const clearForm = () => {
    setSelectedInjuries([]);
    setShowInjuries(false);
    setRecordId(null);
  };

  // 1) Si pulsaste “Nuevo” en Home, clearForm()
  useFocusEffect(useCallback(() => {
    if (getSessionRecordId() === null) {
      clearForm();
    }
  }, []));

  // 2) Inicializa BD, reserva stubs y carga datos previos
  useEffect(() => {
    (async () => {
      await initDatabase();
      const id = paramId || getSessionRecordId();
      if (!id) return;
      setRecordId(id);
      await createAllStubs(id);
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

  // 3) Guardar o “Terminar más tarde”
  const onSave = async (statusLabel) => {
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
      }, statusLabel);
      await createAllStubs(id);
      setSessionRecordId(id);
      setRecordId(id);
    } else {
      await updateRecord(id, { status: statusLabel });
    }

    // actualizar lesiones
    await updatePhysicalExploration(id, {
      injuries: JSON.stringify(selectedInjuries)
    });

    Alert.alert(
      statusLabel === 'saved' ? 'Guardado' : 'Pendiente',
      `Exploración física ID ${id} → status: ${statusLabel}`
    );
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
        onPress={() => setShowInjuries(!showInjuries)}
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

      <Modal visible={showInjuries} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Tipo de lesión</Text>
            <View style={styles.areaArea}>
              <CheckListV1
                items={INJURIES}
                selectedItems={selectedInjuries}
                setSelectedItems={setSelectedInjuries}
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
        <IconImageV1 />
      </View>

      <TouchableOpacity
        style={styles.saveButton}
        onPress={() => onSave('saved')}
      >
        <Text style={styles.buttonText}>Guardar</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.saveButton}
        onPress={() => onSave('pending')}
      >
        <Text style={styles.buttonText}>Terminar más tarde</Text>
      </TouchableOpacity>
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
