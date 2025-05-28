// app/(tabs)/PatientConditionScreen.js
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
  updatePatientCondition,
  updateRecord,
  getPatientConditionById,
  getSessionRecordId,
  setSessionRecordId
} from '../../services/database';

export default function PatientConditionScreen() {
  const { recordId: rawParam } = useLocalSearchParams();
  const paramId = rawParam ? parseInt(rawParam, 10) : null;
  const router = useRouter();

  const sessionId = getSessionRecordId();
  const [recordId, setRecordId] = useState(paramId || sessionId);

  // Campos de condición
  const [stability, setStability]             = useState('');
  const [patientColor, setPatientColor]       = useState('');
  const [airway, setAirway]                   = useState('');
  const [decompression, setDecompression]     = useState('');
  const [side, setSide]                       = useState('');
  const [cervical, setCervical]               = useState('');
  const [ventilatoryHelp, setVentilatoryHelp] = useState('');
  const [oxygenTherapy, setOxygenTherapy]     = useState('');
  const [hemorrhageCtrl, setHemorrhageCtrl]   = useState('');
  const [solutionType, setSolutionType]       = useState('');
  const [rcp, setRcp]                         = useState('');

  // Opciones
  const stabilityItems       = ['Si','No'];
  const patientColors        = ['No aplica','Rojo','Amarillo','Verde','Negra'];
  const airways              = ['No aplica','Aspiración','Cánula orofaríngea','Cánula nasofaríngea','Intubación endotraqueal','Mascarilla laríngea','Combitubo','Cricotirodotomía'];
  const decompressionItems   = ['No','Si'];
  const sides                = ['Derecho','Izquierdo'];
  const cervicals            = ['No aplica','Manual','Collarín','Collarín blando'];
  const ventilatoryHelpItems = ['No aplica','BVM','Ventilador automático'];
  const oxygenTherapyItems   = ['No aplica','Puntas nasales','Mascarilla simple','Reservorio','Venturi'];
  const hemorrhageItems      = ['No aplica','Presión directa','Indirecta','Gravedad','Vendaje compresivo','Crioterapia','Hemostático'];
  const solutionTypes        = ['No aplica','Hartman','NaCl 0.9%','Mixta','Glucosa 5%'];
  const rcps                 = ['No aplica','RCP básica','RCP avanzada'];

  // Limpia al pulsar “Nuevo”
  const clearForm = () => {
    setStability('');
    setPatientColor('');
    setAirway('');
    setDecompression('');
    setSide('');
    setCervical('');
    setVentilatoryHelp('');
    setOxygenTherapy('');
    setHemorrhageCtrl('');
    setSolutionType('');
    setRcp('');
    setRecordId(null);
  };
  useFocusEffect(useCallback(() => {
    if (getSessionRecordId() === null) clearForm();
  }, [sessionId]));

  // Inicializa BD, stubs y carga datos previos
  useEffect(() => {
    (async () => {
      await initDatabase();
      const id = paramId || getSessionRecordId();
      if (!id) return;
      setRecordId(id);
      await createAllStubs(id);
      const prev = await getPatientConditionById(id);
      if (prev) {
        setStability(prev.stability || '');
        setPatientColor(prev.patientColor || '');
        setAirway(prev.airway || '');
        setDecompression(prev.decompression || '');
        setSide(prev.side || '');
        setCervical(prev.cervical || '');
        setVentilatoryHelp(prev.ventilatoryHelp || '');
        setOxygenTherapy(prev.oxygenTherapy || '');
        setHemorrhageCtrl(prev.hemorrhageCtrl || '');
        setSolutionType(prev.solutionType || '');
        setRcp(prev.rcp || '');
      }
    })();
  }, [paramId, sessionId]);

  // Guardar / Terminar más tarde
  const onSave = async (statusLabel) => {
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

    await updatePatientCondition(id, {
      stability,
      patientColor,
      airway,
      decompression,
      side,
      cervical,
      ventilatoryHelp,
      oxygenTherapy,
      hemorrhageCtrl,
      solutionType,
      rcp
    });

    Alert.alert(
      statusLabel === 'saved' ? 'Guardado' : 'Pendiente',
      `Condición del paciente ID ${id} → status: ${statusLabel}`
    );

    router.push({
      pathname: '/FirstEvaluationScreen',
      params: { recordId: id }
    });
  };

  return (
    <ScrollView contentContainerStyle={styles.container} nestedScrollEnabled>
      <Text style={styles.title}>Condición del Paciente</Text>
      <Text style={styles.subtitle}>Expediente médico</Text>
      <Image style={styles.image} source={require('../assets/doctor.png')} />

      <CustomPicker label="Se encuentra estable"      selectedValue={stability}       onValueChange={setStability}       options={stabilityItems} />
      <CustomPicker label="Color del paciente"        selectedValue={patientColor}     onValueChange={setPatientColor}     options={patientColors} />
      <CustomPicker label="Vía aérea"                 selectedValue={airway}           onValueChange={setAirway}           options={airways} />
      <CustomPicker label="Descompresión pleural"     selectedValue={decompression}    onValueChange={setDecompression}    options={decompressionItems} />
      <CustomPicker label="Lado"                      selectedValue={side}             onValueChange={setSide}             options={sides} />
      <CustomPicker label="Control cervical"          selectedValue={cervical}         onValueChange={setCervical}         options={cervicals} />
      <CustomPicker label="Asistencia ventilatoria"   selectedValue={ventilatoryHelp}  onValueChange={setVentilatoryHelp}  options={ventilatoryHelpItems} />
      <CustomPicker label="Oxigenoterapia"            selectedValue={oxygenTherapy}    onValueChange={setOxygenTherapy}    options={oxygenTherapyItems} />
      <CustomPicker label="Control de hemorragías"    selectedValue={hemorrhageCtrl}   onValueChange={setHemorrhageCtrl}   options={hemorrhageItems} />
      <CustomPicker label="Tipo de soluciones"        selectedValue={solutionType}     onValueChange={setSolutionType}     options={solutionTypes} />
      <CustomPicker label="RCP"                       selectedValue={rcp}              onValueChange={setRcp}              options={rcps} />

      <TouchableOpacity style={styles.saveButton}    onPress={() => onSave('saved')}   ><Text style={styles.buttonText}>Guardar</Text></TouchableOpacity>
      <TouchableOpacity style={styles.pendingButton} onPress={() => onSave('pending')}><Text style={styles.buttonText}>Terminar más tarde</Text></TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container:     { padding:20, alignItems:'center', backgroundColor:'#f5f5f5' },
  title:         { fontSize:24, fontWeight:'bold', marginBottom:10 },
  subtitle:      { fontSize:18, fontWeight:'600', color:'#555', marginBottom:20 },
  image:         { width:100, height:100, marginBottom:20, borderRadius:8 },
  saveButton:    { backgroundColor:'#28a745', padding:12, borderRadius:8, width:'100%', marginTop:20 },
  pendingButton: { backgroundColor:'#6c757d', padding:12, borderRadius:8, width:'100%', marginTop:10 },
  buttonText:    { color:'#fff', textAlign:'center', fontWeight:'bold' }
});
