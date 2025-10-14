// app/(tabs)/PhysicalExplorationScreen.js
import React, { useState, useEffect, useCallback, useRef, memo } from 'react';
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
  TextInput,
  useWindowDimensions,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';

import CheckListV1 from '../components/CheckListV1';
import IconImageV1 from '../components/IconImageV1';
import FloatingLabelInput from '../components/FloatingLabelInput';

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
  // vitales + sample
  getVitalSignsByRecordId,
  updateVitalSigns,
  getSampleNotesById,
  updateSampleNotes,
} from '../../services/database';

/* ---------- SUBCOMPONENTES (fuera del componente principal) ---------- */
const HCell = memo(({ children, w = 90 }) => (
  <View style={[styles.cell, styles.cellHeader, { width: w }]}>
    <Text style={styles.cellHeaderText}>{children}</Text>
  </View>
));

const CellInput = memo(({ value, onChangeText, w = 90, kb = 'default', editable = true }) => (
  <View style={[styles.cell, { width: w }]}>
    <TextInput
      style={styles.cellInput}
      value={value}
      onChangeText={onChangeText}
      editable={editable}
      keyboardType={kb}
      placeholder=""
      blurOnSubmit={false}
      autoCorrect={false}
      autoCapitalize="none"
      returnKeyType="done"
    />
  </View>
));

const NeuroCell = memo(({ value, onChange, w = 200, disabled }) => {
  const Opt = ({ v }) => (
    <TouchableOpacity
      onPress={() => !disabled && onChange(v)}
      style={[styles.neuroBtn, value === v && styles.neuroBtnActive]}
      disabled={disabled}
    >
      <Text style={[styles.neuroTxt, value === v && styles.neuroTxtActive]}>{v}</Text>
    </TouchableOpacity>
  );
  return (
    <View style={[styles.cell, { width: w, paddingHorizontal: 8 }]}>
      <View style={styles.neuroGroup}>
        {['A', 'V', 'D', 'I'].map((v) => (
          <Opt key={v} v={v} />
        ))}
      </View>
    </View>
  );
});
/* -------------------------------------------------------------------- */

const INJURIES = [
  'Deformidades (D)','Contusiones (CD)','Abrasiones (A)','Penetraciones (P)',
  'Movimiento paradóudico (MP)','Crepitación (C)','Heridas (H)','Fracturas (P)',
  'Émﬁsema subcutáneo (ES)','Quemaduras (Q)','Laceraciones (L)','Edema (E)',
  'Alteración de sensibilidad (AS)','Alteración de movilidad (AM)','Dolor (DO)',
];

const COLOR_PALETTE = [
  '#F44336','#E91E63','#9C27B0','#673AB7','#3F51B5',
  '#2196F3','#03A9F4','#00BCD4','#009688','#4CAF50',
  '#8BC34A','#CDDC39','#FFC107','#FF9800','#FF5722',
];

const blankVitalRow = (i) => ({
  rowIndex: i,
  hour: '', fr: '', fc: '', tas: '', tad: '', sao2: '', temp: '', gluc: '', ekg: '', neuro: ''
});

export default function PhysicalExplorationScreen() {
  const { recordId: rawParam } = useLocalSearchParams();
  const paramId = rawParam ? parseInt(rawParam, 10) : null;
  const router = useRouter();

  // session-first (como tus otras pantallas)
  const [recordId, setRecordId] = useState(() => paramId ?? getSessionRecordId() ?? null);
  const [status, setStatus] = useState('pending');
  const isLocked = status === 'saved';

  const [selectedInjuries, setSelectedInjuries] = useState([]);
  const [points, setPoints] = useState([]);
  const [nextColorIdx, setNextColorIdx] = useState(0);
  const [selectedPointId, setSelectedPointId] = useState(null);
  const [canvasW, setCanvasW] = useState(0);
  const [canvasH, setCanvasH] = useState(0);
  const [showInjuries, setShowInjuries] = useState(false);

  // VITALES
  const [vitalRows, setVitalRows] = useState([blankVitalRow(1), blankVitalRow(2), blankVitalRow(3)]);

  // SAMPLE
  const [sSigns, setSSigns] = useState('');
  const [sMeds, setSMeds] = useState('');
  const [sAllergies, setSAllergies] = useState('');
  const [sPaths, setSPaths] = useState('');
  const [sLastIntake, setSLastIntake] = useState('');
  const [sEvents, setSEvents] = useState('');

  const clearForm = () => {
    setSelectedInjuries([]); setPoints([]); setNextColorIdx(0); setSelectedPointId(null);
    setShowInjuries(false);
    setVitalRows([blankVitalRow(1), blankVitalRow(2), blankVitalRow(3)]);
    setSSigns(''); setSMeds(''); setSAllergies(''); setSPaths(''); setSLastIntake(''); setSEvents('');
    setStatus('pending');
  };

  useFocusEffect(
    useCallback(() => {
      const sid = getSessionRecordId();
      if (sid !== recordId) {
        clearForm();
        setRecordId(sid ?? null);
      }
    }, [recordId])
  );

  useEffect(() => {
    (async () => {
      await initDatabase();
      if (!recordId) return;

      await createAllStubs(recordId);

      const rec = await getRecordById(recordId);
      setStatus(rec?.status || 'pending');

      const prev = await getPhysicalExplorationById(recordId);
      if (prev?.injuries) {
        try {
          const parsed = JSON.parse(prev.injuries);
          if (Array.isArray(parsed)) setSelectedInjuries(parsed);
          else if (parsed && typeof parsed === 'object') {
            setSelectedInjuries(Array.isArray(parsed.types) ? parsed.types : []);
            if (Array.isArray(parsed.points)) {
              setPoints(parsed.points);
              setNextColorIdx(parsed.points.length % COLOR_PALETTE.length);
            } else { setPoints([]); setNextColorIdx(0); }
          }
        } catch {
          setSelectedInjuries([]); setPoints([]); setNextColorIdx(0);
        }
      } else { setSelectedInjuries([]); setPoints([]); setNextColorIdx(0); }

      const vit = await getVitalSignsByRecordId(recordId);
      if (vit?.length) {
        const rows = vit.map(v => ({
          rowIndex: v.rowIndex,
          hour: v.hour || '', fr: v.fr || '', fc: v.fc || '',
          tas: v.tas || '', tad: v.tad || '', sao2: v.sao2 || '',
          temp: v.temp || '', gluc: v.gluc || '', ekg: v.ekg || '', neuro: v.neuro || ''
        })).sort((a,b)=>a.rowIndex-b.rowIndex);
        setVitalRows(rows);
      } else {
        setVitalRows([blankVitalRow(1), blankVitalRow(2), blankVitalRow(3)]);
      }

      const s = await getSampleNotesById(recordId);
      setSSigns(s?.signsSymptoms || '');
      setSMeds(s?.meds || '');
      setSAllergies(s?.allergies || '');
      setSPaths(s?.pathologies || '');
      setSLastIntake(s?.lastIntakeTime || '');
      setSEvents(s?.relatedEvents || '');
    })();
  }, [recordId]);

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

    await updatePhysicalExploration(id, { injuries: JSON.stringify({ types: selectedInjuries, points }) });
    await updateVitalSigns(id, vitalRows);
    await updateSampleNotes(id, {
      signsSymptoms:  sSigns,
      meds:           sMeds,
      allergies:      sAllergies,
      pathologies:    sPaths,
      lastIntakeTime: sLastIntake,
      relatedEvents:  sEvents,
    });

    Alert.alert('Guardado', `Exploración física ID ${id} → borrador`);
    router.push({ pathname: '/PatientConditionScreen', params: { recordId: id } });
  };

  // Puntos
  const addPointAt = (xPx, yPx) => {
    if (isLocked || canvasW <= 0 || canvasH <= 0) return;
    const x = Math.min(1, Math.max(0, xPx / canvasW));
    const y = Math.min(1, Math.max(0, yPx / canvasH));
    const id = `${Date.now()}-${Math.random().toString(36).slice(2,8)}`;
    const colorIndex = nextColorIdx;
    setPoints(prev => [...prev, { id, x, y, colorIndex }]);
    setNextColorIdx((colorIndex + 1) % COLOR_PALETTE.length);
    setSelectedPointId(id);
  };

  const addLayerHandlers = {
    onStartShouldSetResponder: () => !isLocked,
    onResponderRelease: (e) => {
      const { locationX, locationY } = e.nativeEvent;
      addPointAt(locationX, locationY);
    },
  };

  const pansRef = useRef({});
  const ensurePanFor = (id) => {
    if (pansRef.current[id]) return pansRef.current[id];
    let startX = 0, startY = 0;

    pansRef.current[id] = PanResponder.create({
      onStartShouldSetPanResponder: () => !isLocked,
      onMoveShouldSetPanResponder: () => !isLocked,
      onPanResponderGrant: () => {
        if (isLocked) return;
        setSelectedPointId(id);
        const p = points.find(pp => pp.id === id);
        startX = p?.x ?? 0; startY = p?.y ?? 0;
      },
      onPanResponderMove: (_, g) => {
        if (isLocked) return;
        const absX = startX * canvasW + g.dx;
        const absY = startY * canvasH + g.dy;
        const nx = Math.min(1, Math.max(0, absX / canvasW));
        const ny = Math.min(1, Math.max(0, absY / canvasH));
        setPoints(prev => prev.map(p => (p.id === id ? { ...p, x: nx, y: ny } : p)));
      },
      onPanResponderRelease: (_, g) => {
        if (Math.hypot(g.dx, g.dy) < 5) setSelectedPointId(id);
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
    setPoints([]); setSelectedPointId(null); setNextColorIdx(0);
  };

  // Área responsiva de la silueta
  const { width: screenW } = useWindowDimensions();
  const CONTENT_PADDING = 20;
  const MAX_AREA_WIDTH = 1200;
  const { width: imgW, height: imgH } = Image.resolveAssetSource(require('../assets/body.png'));
  const ratio = imgH / imgW || (450 / 500);
  const areaW = Math.min(screenW - CONTENT_PADDING * 2, MAX_AREA_WIDTH);
  const areaH = Math.round(areaW * ratio);
  const markerSize = 20;

  // Tabla vitales helpers
  const setCell = (i, key, val) => {
    if (isLocked) return;
    setVitalRows(rows => rows.map(r => (r.rowIndex === i ? { ...r, [key]: val } : r)));
  };
  const setNeuro = (i, val) => setCell(i, 'neuro', val);

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
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

      {/* Modal checklist */}
      <Modal visible={showInjuries} animationType="slide" transparent onRequestClose={() => setShowInjuries(false)}>
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

      {/* Imagen + puntos */}
      <View
        style={[styles.imageArea, { width: areaW, height: areaH }]}
        onLayout={(e) => {
          const { width, height } = e.nativeEvent.layout;
          setCanvasW(width); setCanvasH(height);
        }}
      >
        <IconImageV1 presetPoints={false} />
        {!isLocked && <View {...addLayerHandlers} style={StyleSheet.absoluteFill} pointerEvents="box-only" />}
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

      {/* Acciones puntos */}
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

      {/* --------- Signos vitales y monitoreo --------- */}
      <Text style={styles.sectionTitle}>Signos vitales y monitoreo</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ width: '100%' }} keyboardShouldPersistTaps="handled">
        <View>
          {/* Header */}
          <View style={[styles.row, styles.rowHeader]}>
            <HCell w={70}>Hora</HCell>
            <HCell w={70}>FR</HCell>
            <HCell w={70}>FC</HCell>
            <HCell w={80}>TAS</HCell>
            <HCell w={80}>TAD</HCell>
            <HCell w={80}>SaO2</HCell>
            <HCell w={80}>Temp</HCell>
            <HCell w={80}>Gluc</HCell>
            <HCell w={100}>EKG</HCell>
            <HCell w={200}>Neurológico</HCell>
          </View>

          {/* Filas */}
          {vitalRows.map((r) => (
            <View key={r.rowIndex} style={styles.row}>
              <CellInput value={r.hour} onChangeText={(t)=>setCell(r.rowIndex,'hour',t)} w={70} editable={!isLocked} />
              <CellInput value={r.fr}   onChangeText={(t)=>setCell(r.rowIndex,'fr',t)}   w={70} editable={!isLocked} />
              <CellInput value={r.fc}   onChangeText={(t)=>setCell(r.rowIndex,'fc',t)}   w={70} editable={!isLocked} />
              <CellInput value={r.tas}  onChangeText={(t)=>setCell(r.rowIndex,'tas',t)}  w={80} editable={!isLocked} />
              <CellInput value={r.tad}  onChangeText={(t)=>setCell(r.rowIndex,'tad',t)}  w={80} editable={!isLocked} />
              <CellInput value={r.sao2} onChangeText={(t)=>setCell(r.rowIndex,'sao2',t)} w={80} editable={!isLocked} />
              <CellInput value={r.temp} onChangeText={(t)=>setCell(r.rowIndex,'temp',t)} w={80} editable={!isLocked} />
              <CellInput value={r.gluc} onChangeText={(t)=>setCell(r.rowIndex,'gluc',t)} w={80} editable={!isLocked} />
              <CellInput value={r.ekg}  onChangeText={(t)=>setCell(r.rowIndex,'ekg',t)}  w={100} editable={!isLocked} />
              <NeuroCell value={r.neuro} onChange={(v)=>setNeuro(r.rowIndex, v)} w={200} disabled={isLocked} />
            </View>
          ))}
        </View>
      </ScrollView>

      {/* -------------------- SAMPLE ------------------- */}
      <Text style={styles.sectionTitle}>SAMPLE</Text>
      <FloatingLabelInput label="Signos y síntomas" value={sSigns} onChangeText={setSSigns} editable={!isLocked} iconName="assignment" />
      <FloatingLabelInput label="Medicamentos" value={sMeds} onChangeText={setSMeds} editable={!isLocked} iconName="medication" />
      <FloatingLabelInput label="Patologías" value={sPaths} onChangeText={setSPaths} editable={!isLocked} iconName="healing" />
      <FloatingLabelInput label="Alergias" value={sAllergies} onChangeText={setSAllergies} editable={!isLocked} iconName="warning-amber" />
      <FloatingLabelInput label="Hora de última ingesta (HH:mm)" value={sLastIntake} onChangeText={setSLastIntake} editable={!isLocked} iconName="schedule" />
      <FloatingLabelInput label="Eventos previos relacionados" value={sEvents} onChangeText={setSEvents} editable={!isLocked} iconName="event" />

      {!isLocked && (
        <TouchableOpacity style={styles.saveButton} onPress={handleNext}>
          <Text style={styles.buttonText}>Siguiente</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, alignItems: 'center', backgroundColor: '#f5f5f5' },
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

  imageArea: { backgroundColor: '#fff', position: 'relative', overflow: 'hidden', borderRadius: 8 },

  marker: { position: 'absolute', borderRadius: 999 },

  actionsRow: { width: '100%', marginTop: 12, flexDirection: 'row', justifyContent: 'space-between' },
  actionBtn: { backgroundColor: '#ef4444', paddingVertical: 10, paddingHorizontal: 12, borderRadius: 8 },
  actionBtnSecondary: { backgroundColor: '#6b7280', paddingVertical: 10, paddingHorizontal: 12, borderRadius: 8 },
  actionBtnDisabled: { opacity: 0.5 },
  actionBtnText: { color: '#fff', fontWeight: 'bold' },

  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginTop: 22, marginBottom: 10, alignSelf: 'flex-start' },

  row: { flexDirection: 'row' },
  rowHeader: { borderTopLeftRadius: 6, borderTopRightRadius: 6 },
  cell: { width: 90, borderWidth: 1, borderColor: '#ccc', justifyContent: 'center', paddingHorizontal: 6, height: 44, backgroundColor:'#fff' },
  cellHeader: { backgroundColor: '#eef4ff', height: 40 },
  cellHeaderText: { fontWeight: '700', fontSize: 12, textAlign: 'center' },
  cellInput: { fontSize: 14, paddingVertical: 4, textAlign: 'center' },

  neuroGroup: { flexDirection:'row', alignItems:'center', justifyContent:'space-between', width:'100%' },
  neuroBtn: { width:40, height:28, borderWidth:1, borderColor:'#aaa', borderRadius:6, alignItems:'center', justifyContent:'center', backgroundColor:'#fff' },
  neuroBtnActive: { backgroundColor:'#2563eb', borderColor:'#2563eb' },
  neuroTxt: { fontWeight:'700', color:'#000' },
  neuroTxtActive: { color:'#fff' },

  smallBtn: { backgroundColor:'#0ea5e9', paddingVertical:8, paddingHorizontal:12, borderRadius:8 },
  smallBtnGray: { backgroundColor:'#6b7280', paddingVertical:8, paddingHorizontal:12, borderRadius:8 },
  smallBtnTxt: { color:'#fff', fontWeight:'bold' },

  saveButton: { backgroundColor: '#28a745', padding: 10, borderRadius: 8, marginTop: 20, width: '100%' },
});
