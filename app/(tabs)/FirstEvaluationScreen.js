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
  getSessionRecordId,
  setSessionRecordId
} from '../../services/database';

export default function FirstEvaluationScreen() {
  const { recordId: rawParam } = useLocalSearchParams();
  const paramId = rawParam ? parseInt(rawParam, 10) : null;
  const router = useRouter();

  const sessionId = getSessionRecordId();
  const [recordId, setRecordId] = useState(paramId || sessionId);

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
  const respSoundsItems  = [
    'No aplica','Ruidos normales','Ruidos disminuidos','Ruidos ausentes'
  ];
  const lungSideItems    = ['No aplica','Derecho','Izquierdo','Ambos'];
  const lungPartItems    = ['No aplica','Apical','Base','Ambos'];
  const qualityItems     = ['No aplica','Rápido','Lento','Rítmico','Arítmico'];
  const swallowingItems  = ['No aplica','Ausente','Presente'];
  const skinItems        = ['No aplica','Pálida','Cianótica'];
  const characteristicsItems = ['No aplica','Eutérmica','Caliente','Fría','Diaforesis'];

  const clearForm = () => {
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
  };

  // Limpia al pulsar “Nuevo” en index (sessionId → null)
  useFocusEffect(useCallback(() => {
    if (getSessionRecordId() === null) {
      clearForm();
    }
  }, [sessionId]));

  // Inicializa BD y carga datos previos si existe ID
  useEffect(() => {
    (async () => {
      await initDatabase();
      const id = paramId || getSessionRecordId();
      if (!id) return;
      setRecordId(id);
      await createAllStubs(id);
      const prev = await getFirstEvaluationById(id);
      if (!prev) return;
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
    })();
  }, [paramId, sessionId]);

  // Guardar / Terminar más tarde
  const onSave = async (statusLabel) => {
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
      }, statusLabel);
      await createAllStubs(id);
      setSessionRecordId(id);
      setRecordId(id);
    } else {
      await updateRecord(id, { status: statusLabel });
    }

    // ACTUALIZA CORRECTAMENTE LA COLUMNA respSoundsItem
    await updateFirstEvaluation(id, {
      evaluationItem,
      ventilationItem,
      circulationItem,
      airRouteItem,
      respSoundsItem,
      lungSideItem,
      lungPartItem,
      qualityItem,
      swallowingReflexItem,
      skinItem,
      characteristicsItem
    });

    Alert.alert(
      statusLabel === 'saved' ? 'Guardado' : 'Pendiente',
      `Evaluación inicial ID ${id} → status: ${statusLabel}`
    );

    // ir a la siguiente pantalla
    router.push({
      pathname: '/PhysicalExplorationScreen',
      params: { recordId: id }
    });
  };

  return (
    <ScrollView contentContainerStyle={s.container} nestedScrollEnabled>
      <Text style={s.title}>Evaluación Inicial</Text>
      <Image style={s.image} source={require('../assets/doctor.png')} />

      <CustomPicker
        label="Evaluación inicial"
        selectedValue={evaluationItem}
        onValueChange={setEvaluationItem}
        options={firstEvaluationItems}
      />
      <CustomPicker
        label="Ventilación"
        selectedValue={ventilationItem}
        onValueChange={setVentilationItem}
        options={ventilationItems}
      />
      <CustomPicker
        label="Circulación"
        selectedValue={circulationItem}
        onValueChange={setCirculationItem}
        options={circulationItems}
      />
      <CustomPicker
        label="Vía aérea"
        selectedValue={airRouteItem}
        onValueChange={setAirRouteItem}
        options={airRouteItems}
      />
      <CustomPicker
        label="Ruidos respiratorios"
        selectedValue={respSoundsItem}
        onValueChange={setRespSoundsItem}
        options={respSoundsItems}
      />
      <CustomPicker
        label="Lado del pulmón"
        selectedValue={lungSideItem}
        onValueChange={setLungSideItem}
        options={lungSideItems}
      />
      <CustomPicker
        label="Parte del pulmón"
        selectedValue={lungPartItem}
        onValueChange={setLungPartItem}
        options={lungPartItems}
      />
      <CustomPicker
        label="Calidad"
        selectedValue={qualityItem}
        onValueChange={setQualityItem}
        options={qualityItems}
      />
      <CustomPicker
        label="Reflejo de deglución"
        selectedValue={swallowingReflexItem}
        onValueChange={setSwallowingReflexItem}
        options={swallowingItems}
      />
      <CustomPicker
        label="Piel"
        selectedValue={skinItem}
        onValueChange={setSkinItem}
        options={skinItems}
      />
      <CustomPicker
        label="Características"
        selectedValue={characteristicsItem}
        onValueChange={setCharacteristicsItem}
        options={characteristicsItems}
      />

      <TouchableOpacity style={s.saveButton} onPress={() => onSave('saved')}>
        <Text style={s.buttonText}>Guardar</Text>
      </TouchableOpacity>
      <TouchableOpacity style={s.pendingButton} onPress={() => onSave('pending')}>
        <Text style={s.buttonText}>Terminar más tarde</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container:     { padding:20, alignItems:'center', backgroundColor:'#f5f5f5' },
  title:         { fontSize:24, fontWeight:'bold', marginBottom:10 },
  image:         { width:100, height:100, marginBottom:20, borderRadius:8 },
  saveButton:    { backgroundColor:'#28a745', padding:12, borderRadius:8, marginTop:20, width:'100%' },
  pendingButton: { backgroundColor:'#6c757d', padding:12, borderRadius:8, marginTop:10, width:'100%' },
  buttonText:    { color:'#fff', textAlign:'center', fontWeight:'bold' },
});
