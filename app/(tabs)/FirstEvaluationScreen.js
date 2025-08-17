// app/(tabs)/FirstEvaluationScreen.js
import React, { useState, useEffect, useCallback } from 'react';
import {
  ScrollView,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';

import CustomPicker from '../components/CustomPicker';

import {
  initDatabase,
  insertRecord,
  createAllStubs,
  updateFirstEvaluation,
  updateRecord,
  getFirstEvaluationById,
  getRecordById,            // ← para leer status y bloquear si es 'saved'
  getSessionRecordId,
  setSessionRecordId
} from '../../services/database';

export default function FirstEvaluationScreen() {
  const { recordId: rawParam } = useLocalSearchParams();
  const paramId = rawParam ? parseInt(rawParam, 10) : null;
  const router = useRouter();

  const sessionId = getSessionRecordId();
  const [recordId, setRecordId] = useState(paramId || sessionId || null);

  // Estado del expediente (para bloqueo)
  const [status, setStatus] = useState('pending');
  const isLocked = status === 'saved';

  // Campos de primera evaluación
  const [evaluationItem, setEvaluationItem]             = useState('');
  const [ventilationItem, setVentilationItem]           = useState('');
  const [circulationItem, setCirculationItem]           = useState('');
  const [airRouteItem, setAirRouteItem]                 = useState('');
  const [respSoundsItem, setRespSoundsItem]             = useState('');
  const [lungSideItem, setLungSideItem]                 = useState('');
  const [lungPartItem, setLungPartItem]                 = useState('');
  const [qualityItem, setQualityItem]                   = useState('');
  const [swallowingReflexItem, setSwallowingReflexItem] = useState('');
  const [skinItem, setSkinItem]                         = useState('');
  const [characteristicsItem, setCharacteristicsItem]   = useState('');

  // Opciones para los pickers
  const firstEvaluationItems = [
    'No aplica','Consciente','Respuesta a estimulo verbal',
    'Respuesta a estimulo doloroso','Inconsciente'
  ];
  const ventilationItems = [
    'No aplica','Automatismo regular','Automatismo irregular',
    'Ventilación rápida','Ventilación superficial','Apnea'
  ];
  const circulationItems = ['No aplica','Carotideo','Radial','Paro cardiorespiratorio'];
  const airRouteItems    = ['No aplica','Permeable','Comprometida'];
  const respSoundsItems  = ['No aplica','Ruidos normales','Ruidos disminuidos','Ruidos ausentes'];
  const lungSideItems    = ['No aplica','Derecho','Izquierdo','Ambos'];
  const lungPartItems    = ['No aplica','Apical','Base','Ambos'];
  const qualityItems     = ['No aplica','Rápido','Lento','Rítmico','Arítmico'];
  const swallowingItems  = ['No aplica','Ausente','Presente'];
  const skinItems        = ['No aplica','Pálida','Cianótica'];
  const characteristicsItems = ['No aplica','Eutérmica','Caliente','Fría','Diaforesis'];

  // Defaults visuales y para guardado (si no tocan los pickers)
  const computeDefaults = () => ({
    evaluationItem: 'No aplica',
    ventilationItem: 'No aplica',
    circulationItem: 'No aplica',
    airRouteItem: 'No aplica',
    respSoundsItem: 'No aplica',
    lungSideItem: 'No aplica',
    lungPartItem: 'No aplica',
    qualityItem: 'No aplica',
    swallowingReflexItem: 'No aplica',
    skinItem: 'No aplica',
    characteristicsItem: 'No aplica',
  });
  const coalesce = (val, def) => (val !== undefined && val !== null && val !== '' ? val : def);

  const applyDefaultsToUI = () => {
    const DEF = computeDefaults();
    setEvaluationItem(DEF.evaluationItem);
    setVentilationItem(DEF.ventilationItem);
    setCirculationItem(DEF.circulationItem);
    setAirRouteItem(DEF.airRouteItem);
    setRespSoundsItem(DEF.respSoundsItem);
    setLungSideItem(DEF.lungSideItem);
    setLungPartItem(DEF.lungPartItem);
    setQualityItem(DEF.qualityItem);
    setSwallowingReflexItem(DEF.swallowingReflexItem);
    setSkinItem(DEF.skinItem);
    setCharacteristicsItem(DEF.characteristicsItem);
  };

  const clearForm = () => {
    // Limpiar y dejar que luego setee defaults visuales
    setEvaluationItem('');
    setVentilationItem('');
    setCirculationItem('');
    setAirRouteItem('');
    setRespSoundsItem('');
    setLungSideItem('');
    setLungPartItem('');
    setQualityItem('');
    setSwallowingReflexItem('');
    setSkinItem('');
    setCharacteristicsItem('');
    setRecordId(null);
    setStatus('pending');
  };

  // Limpia al pulsar “Nuevo” en index (sessionId → null)
  useFocusEffect(useCallback(() => {
    if (getSessionRecordId() === null && paramId === null) {
      clearForm();
      // Defaults visibles para nuevo formulario
      applyDefaultsToUI();
    }
  }, [paramId]));

  // Inicializa BD y carga datos previos si existe ID
  useEffect(() => {
    (async () => {
      await initDatabase();
      const id = paramId || getSessionRecordId();
      if (!id) {
        // si no hay ID pero la UI quedó vacía, muestra defaults
        if (!evaluationItem) applyDefaultsToUI();
        return;
      }
      setRecordId(id);
      await createAllStubs(id);

      // Lee status para bloqueo
      const rec = await getRecordById(id);
      if (rec) setStatus(rec.status || 'pending');

      const prev = await getFirstEvaluationById(id);
      if (prev) {
        setEvaluationItem(prev.evaluationItem           || '');
        setVentilationItem(prev.ventilationItem         || '');
        setCirculationItem(prev.circulationItem         || '');
        setAirRouteItem(prev.airRouteItem               || '');
        setRespSoundsItem(prev.respSoundsItem           || '');
        setLungSideItem(prev.lungSideItem               || '');
        setLungPartItem(prev.lungPartItem               || '');
        setQualityItem(prev.qualityItem                 || '');
        setSwallowingReflexItem(prev.swallowingReflexItem || '');
        setSkinItem(prev.skinItem                       || '');
        setCharacteristicsItem(prev.characteristicsItem || '');
      } else {
        // No hay data previa → mostrar defaults en UI
        applyDefaultsToUI();
      }
    })();
  }, [paramId, sessionId]);

  // Botón único “Siguiente”: guarda como pending y navega
  const handleNext = async () => {
    if (isLocked) {
      Alert.alert('Expediente finalizado', 'Este expediente ya está firmado y no puede editarse.');
      return;
    }

    let id = recordId;
    if (!id) {
      // crear expediente padre si no existe
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
      await updateRecord(id, { status: 'pending' });
    }

    const DEF = computeDefaults();

    await updateFirstEvaluation(id, {
      evaluationItem:        coalesce(evaluationItem,        DEF.evaluationItem),
      ventilationItem:       coalesce(ventilationItem,       DEF.ventilationItem),
      circulationItem:       coalesce(circulationItem,       DEF.circulationItem),
      airRouteItem:          coalesce(airRouteItem,          DEF.airRouteItem),
      respSoundsItem:        coalesce(respSoundsItem,        DEF.respSoundsItem),
      lungSideItem:          coalesce(lungSideItem,          DEF.lungSideItem),
      lungPartItem:          coalesce(lungPartItem,          DEF.lungPartItem),
      qualityItem:           coalesce(qualityItem,           DEF.qualityItem),
      swallowingReflexItem:  coalesce(swallowingReflexItem,  DEF.swallowingReflexItem),
      skinItem:              coalesce(skinItem,              DEF.skinItem),
      characteristicsItem:   coalesce(characteristicsItem,   DEF.characteristicsItem),
    });

    Alert.alert('Guardado', `Evaluación inicial guardada (ID ${id})`);

    router.push({
      pathname: '/PhysicalExplorationScreen',
      params: { recordId: id }
    });
  };

  return (
    <ScrollView contentContainerStyle={s.container} nestedScrollEnabled>
      <Text style={s.title}>Evaluación Inicial</Text>
      <Image style={s.image} source={require('../assets/doctor.png')} />

      {/* Estado visual */}
      <Text style={[s.badge, isLocked ? s.badgeSaved : s.badgePending]}>
        {isLocked ? 'Finalizado' : 'Borrador'}
      </Text>

      <CustomPicker label="Evaluación inicial"     selectedValue={evaluationItem}     onValueChange={(v)=>!isLocked&&setEvaluationItem(v)}     options={firstEvaluationItems} enabled={!isLocked} />
      <CustomPicker label="Ventilación"            selectedValue={ventilationItem}    onValueChange={(v)=>!isLocked&&setVentilationItem(v)}    options={ventilationItems}     enabled={!isLocked} />
      <CustomPicker label="Circulación"            selectedValue={circulationItem}    onValueChange={(v)=>!isLocked&&setCirculationItem(v)}    options={circulationItems}     enabled={!isLocked} />
      <CustomPicker label="Vía aérea"              selectedValue={airRouteItem}       onValueChange={(v)=>!isLocked&&setAirRouteItem(v)}       options={airRouteItems}        enabled={!isLocked} />
      <CustomPicker label="Ruidos respiratorios"   selectedValue={respSoundsItem}     onValueChange={(v)=>!isLocked&&setRespSoundsItem(v)}     options={respSoundsItems}      enabled={!isLocked} />
      <CustomPicker label="Lado del pulmón"        selectedValue={lungSideItem}       onValueChange={(v)=>!isLocked&&setLungSideItem(v)}       options={lungSideItems}        enabled={!isLocked} />
      <CustomPicker label="Parte del pulmón"       selectedValue={lungPartItem}       onValueChange={(v)=>!isLocked&&setLungPartItem(v)}       options={lungPartItems}        enabled={!isLocked} />
      <CustomPicker label="Calidad"                selectedValue={qualityItem}        onValueChange={(v)=>!isLocked&&setQualityItem(v)}        options={qualityItems}         enabled={!isLocked} />
      <CustomPicker label="Reflejo de deglución"   selectedValue={swallowingReflexItem} onValueChange={(v)=>!isLocked&&setSwallowingReflexItem(v)} options={swallowingItems}  enabled={!isLocked} />
      <CustomPicker label="Piel"                   selectedValue={skinItem}           onValueChange={(v)=>!isLocked&&setSkinItem(v)}           options={skinItems}            enabled={!isLocked} />
      <CustomPicker label="Características"        selectedValue={characteristicsItem} onValueChange={(v)=>!isLocked&&setCharacteristicsItem(v)} options={characteristicsItems} enabled={!isLocked} />

      {/* Botón único: Siguiente (oculto si está finalizado) */}
      {!isLocked && (
        <TouchableOpacity style={s.nextButton} onPress={handleNext}>
          <Text style={s.buttonText}>Siguiente</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container:     { padding:20, alignItems:'center', backgroundColor:'#f5f5f5' },
  title:         { fontSize:24, fontWeight:'bold', marginBottom:10 },
  image:         { width:100, height:100, marginBottom:20, borderRadius:8 },
  badge:         { alignSelf:'flex-end', paddingVertical:4, paddingHorizontal:8, borderRadius:6, color:'#fff', fontWeight:'600', marginBottom:8 },
  badgePending:  { backgroundColor:'#6c757d' },
  badgeSaved:    { backgroundColor:'#28a745' },
  nextButton:    { backgroundColor:'#1f9aef', padding:12, borderRadius:8, marginTop:16, width:'100%' },
  buttonText:    { color:'#fff', textAlign:'center', fontWeight:'bold' },
});
