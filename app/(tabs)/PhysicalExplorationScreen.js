// app/(tabs)/PhysicalExplorationScreen.js
import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  ScrollView,
  View,
  Text,
  Image,
  TouchableOpacity,
  Modal,
  Pressable,
  StyleSheet,
  Alert,
  PanResponder,
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
  getRecordById,
  getSessionRecordId,
  setSessionRecordId,
} from '../../services/database';

const INJURIES = [
  'Deformidades (D)','Contusiones (CD)','Abrasiones (A)','Penetraciones (P)',
  'Movimiento paradóudico (MP)','Crepitación (C)','Heridas (H)','Fracturas (P)',
  'Émﬁsema subcutáneo (ES)','Quemaduras (Q)','Laceraciones (L)','Edema (E)',
  'Alteración de sensibilidad (AS)','Alteración de movilidad (AM)','Dolor (DO)',
];

// 15 colores (cíclicos)
const COLOR_PALETTE = [
  '#F44336','#E91E63','#9C27B0','#673AB7','#3F51B5',
  '#2196F3','#03A9F4','#00BCD4','#009688','#4CAF50',
  '#8BC34A','#CDDC39','#FFC107','#FF9800','#FF5722',
];

export default function PhysicalExplorationScreen() {
  const { recordId: rawParam } = useLocalSearchParams();
  const paramId = rawParam ? parseInt(rawParam, 10) : null;
  const router = useRouter();

  // Estado general
  const [recordId, setRecordId] = useState(paramId || getSessionRecordId());
  const [status, setStatus] = useState('pending');
  const isLocked = status === 'saved';

  // Tipos de lesión
  const [selectedInjuries, setSelectedInjuries] = useState([]);

  // Puntos libres { id, x(0..1), y(0..1), colorIndex }
  const [points, setPoints] = useState([]);
  const [nextColorIdx, setNextColorIdx] = useState(0);
  const [selectedPointId, setSelectedPointId] = useState(null);

  // Dimensiones del lienzo
  const [canvasW, setCanvasW] = useState(0);
  const [canvasH, setCanvasH] = useState(0);

  // Modal checklist
  const [showInjuries, setShowInjuries] = useState(false);

  const clearForm = () => {
    setSelectedInjuries([]);
    setPoints([]);
    setNextColorIdx(0);
    setSelectedPointId(null);
    setShowInjuries(false);
    setRecordId(null);
    setStatus('pending');
  };

  useFocusEffect(useCallback(() => {
    if (getSessionRecordId() === null) clearForm();
  }, []));

  // Carga inicial
  useEffect(() => {
    (async () => {
      await initDatabase();
      const id = paramId || getSessionRecordId();
      if (!id) return;
      setRecordId(id);
      await createAllStubs(id);

      const rec = await getRecordById(id);
      if (rec?.status) setStatus(rec.status);

      const prev = await getPhysicalExplorationById(id);
      if (!prev || !prev.injuries) return;

      try {
        const parsed = JSON.parse(prev.injuries);
        if (Array.isArray(parsed)) {
          setSelectedInjuries(parsed); // compat anterior
        } else if (parsed && typeof parsed === 'object') {
          setSelectedInjuries(Array.isArray(parsed.types) ? parsed.types : []);
          if (Array.isArray(parsed.points)) {
            setPoints(parsed.points);
            setNextColorIdx(parsed.points.length % COLOR_PALETTE.length);
          }
        }
      } catch {/* ignora */}
    })();
  }, [paramId]);

  // Guardar como borrador y avanzar
  const handleNext = async () => {
    if (isLocked) {
      Alert.alert('Expediente finalizado', 'Este expediente ya está firmado y no puede editarse.');
      return;
    }

    let id = recordId;
    if (!id) {
      const now = new Date();
      id = await insertRecord({
        date: now.toISOString().slice(0,10), time: now.toTimeString().slice(0,8),
        weekDay:'', attentionReason:'', serviceLocation:'',
        vehicleType:'', vehicleNum:'', operator:'', intern:'',
        moreInterns:'', affiliation:'', gender:'', age:'',
        address:'', colony:'', municipality:'', phone:'', rightful:''
      }, 'pending');
      await createAllStubs(id);
      setSessionRecordId(id);
      setRecordId(id);
    } else {
      await updateRecord(id, { status: 'pending' });
      setStatus('pending');
    }

    await updatePhysicalExploration(id, {
      injuries: JSON.stringify({ types: selectedInjuries, points })
    });

    Alert.alert('Guardado', `Exploración física ID ${id} → borrador`);
    router.push({ pathname: '/PatientConditionScreen', params: { recordId: id } });
  };

  // Añadir punto con tap
  const addPointAt = (xPx, yPx) => {
    if (isLocked || canvasW <= 0 || canvasH <= 0) return;
    const x = Math.min(1, Math.max(0, xPx / canvasW));
    const y = Math.min(1, Math.max(0, yPx / canvasH));
    const id = `${Date.now()}-${Math.random().toString(36).slice(2,8)}`;
    const colorIndex = nextColorIdx;
    setPoints(prev => [...prev, { id, x, y, colorIndex }]);
    setNextColorIdx((colorIndex + 1) % COLOR_PALETTE.length);
    setSelectedPointId(id); // se selecciona al crearlo
  };

  // Capa para taps (añadir)
  const addLayerHandlers = {
    onStartShouldSetResponder: () => !isLocked,
    onResponderRelease: (e) => {
      const { locationX, locationY } = e.nativeEvent;
      addPointAt(locationX, locationY);
    },
  };

  // PanResponders por id (no por índice) → permite eliminar en cualquier orden sin desalinear
  const pansRef = useRef({});
  const ensurePanFor = (id) => {
    if (pansRef.current[id]) return pansRef.current[id];

    let startX = 0, startY = 0; // relativos 0..1 al iniciar el gesto

    pansRef.current[id] = PanResponder.create({
      onStartShouldSetPanResponder: () => !isLocked,
      onMoveShouldSetPanResponder: () => !isLocked,
      onPanResponderGrant: () => {
        if (isLocked) return;
        // Seleccionar inmediatamente el punto tocado
        setSelectedPointId(id);
        // Guardar posición inicial
        const p = points.find(pp => pp.id === id);
        startX = p?.x ?? 0;
        startY = p?.y ?? 0;
      },
      onPanResponderMove: (_, g) => {
        if (isLocked) return;
        // Mover usando el origen guardado para evitar “saltos”
        const absX = startX * canvasW + g.dx;
        const absY = startY * canvasH + g.dy;
        const nx = Math.min(1, Math.max(0, absX / canvasW));
        const ny = Math.min(1, Math.max(0, absY / canvasH));
        setPoints(prev => prev.map(p => (p.id === id ? { ...p, x: nx, y: ny } : p)));
      },
      onPanResponderRelease: (_, g) => {
        // Si casi no se movió → sólo selección (ya está seleccionada)
        if (Math.hypot(g.dx, g.dy) < 5) {
          setSelectedPointId(id);
        }
      },
    });

    return pansRef.current[id];
  };

  const removeSelected = () => {
    if (!selectedPointId || isLocked) return;
    setPoints(prev => prev.filter(p => p.id !== selectedPointId));
    setSelectedPointId(null);
  };

  const clearAllPoints = () => {
    if (isLocked) return;
    setPoints([]);
    setSelectedPointId(null);
    setNextColorIdx(0);
  };

  // UI
  const markerSize = 20;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Exploración Física</Text>
      <Text style={styles.subtitle}>Expediente médico</Text>

      <Image style={styles.image} source={require('../assets/doctor.png')} />

      <TouchableOpacity
        style={[styles.expandButton, isLocked && { opacity: 0.5 }]}
        onPress={() => { if (!isLocked) setShowInjuries(!showInjuries); }}
        disabled={isLocked}
      >
        <Text style={styles.buttonText}>
          {showInjuries ? 'Cerrar' : 'Elegir tipo de lesión'}
        </Text>
      </TouchableOpacity>

      <Modal
        visible={showInjuries}
        animationType="slide"
        transparent
        onRequestClose={() => setShowInjuries(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Tipo de lesión</Text>
            <View style={styles.areaArea}>
              <CheckListV1
                items={INJURIES}
                selectedItems={selectedInjuries}
                setSelectedItems={(arr) => { if (!isLocked) setSelectedInjuries(arr); }}
              />
            </View>
            <Pressable onPress={() => setShowInjuries(false)} style={styles.closeButton}>
              <Text style={styles.buttonText}>Cerrar</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <View
        style={styles.imageArea}
        onLayout={(e) => {
          const { width, height } = e.nativeEvent.layout;
          setCanvasW(width);
          setCanvasH(height);
        }}
      >
        {/* Silueta */}
        <IconImageV1 presetPoints={false} />

        {/* Capa para añadir puntos con tap */}
        {!isLocked && (
          <View {...addLayerHandlers} style={StyleSheet.absoluteFill} pointerEvents="box-only" />
        )}

        {/* Marcadores (encima) */}
        <View pointerEvents="box-none" style={StyleSheet.absoluteFill}>
          {points.map((p) => {
            const left = p.x * canvasW - markerSize / 2;
            const top  = p.y * canvasH - markerSize / 2;
            const color = COLOR_PALETTE[p.colorIndex % COLOR_PALETTE.length];
            const pan = ensurePanFor(p.id);

            return (
              <View
                key={p.id}
                {...(pan?.panHandlers || {})}
                style={[
                  styles.marker,
                  {
                    left, top, width: markerSize, height: markerSize,
                    backgroundColor: color,
                    borderColor: selectedPointId === p.id ? '#fff' : '#333',
                    borderWidth: selectedPointId === p.id ? 3 : 1,
                    shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 2,
                  },
                ]}
              />
            );
          })}
        </View>
      </View>

      {/* Acciones sobre puntos */}
      <View style={styles.actionsRow}>
        <TouchableOpacity
          onPress={removeSelected}
          disabled={!selectedPointId || isLocked}
          style={[styles.actionBtn, (!selectedPointId || isLocked) && styles.actionBtnDisabled]}
        >
          <Text style={styles.actionBtnText}>Quitar punto seleccionado</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={clearAllPoints}
          disabled={isLocked || points.length === 0}
          style={[styles.actionBtnSecondary, (isLocked || points.length === 0) && styles.actionBtnDisabled]}
        >
          <Text style={styles.actionBtnText}>Quitar todos</Text>
        </TouchableOpacity>
      </View>

      {!isLocked && (
        <TouchableOpacity style={styles.saveButton} onPress={handleNext}>
          <Text style={styles.buttonText}>Siguiente</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, alignItems: 'center', backgroundColor: 'f5f5f5' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 10 },
  subtitle: { fontSize: 18, fontWeight: '600', color: '#555', marginTop: 10, marginBottom: 20, alignSelf: 'center' },
  image: { width: 100, height: 100, marginBottom: 20, borderRadius: 8, resizeMode: 'cover', alignSelf: 'center' },

  expandButton: { backgroundColor: '#007bff', padding: 10, borderRadius: 8, marginBottom: 10 },
  buttonText: { color: 'white', textAlign: 'center', fontWeight: 'bold', fontSize: 18 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: 'white', padding: 20, borderRadius: 15, width: '90%', alignItems: 'center' },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  areaArea: { width: '100%', height: 450 },
  closeButton: { marginTop: 20, backgroundColor: '#007bff', padding: 10, borderRadius: 8 },

  imageArea: { width: 500, height: 450, backgroundColor: '#fff', position: 'relative', overflow: 'hidden' },

  marker: { position: 'absolute', borderRadius: 999 },

  actionsRow: { width: '100%', marginTop: 12, flexDirection: 'row', justifyContent: 'space-between' },
  actionBtn: { backgroundColor: '#ef4444', paddingVertical: 10, paddingHorizontal: 12, borderRadius: 8 },
  actionBtnSecondary: { backgroundColor: '#6b7280', paddingVertical: 10, paddingHorizontal: 12, borderRadius: 8 },
  actionBtnDisabled: { opacity: 0.5 },
  actionBtnText: { color: '#fff', fontWeight: 'bold' },

  saveButton: { backgroundColor: '#28a745', padding: 10, borderRadius: 8, marginTop: 20, width: '100%' },
});
