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
  getRecordById,            //  para leer status y bloquear edición
  getSessionRecordId,
  setSessionRecordId
} from '../../services/database';

export default function PatientConditionScreen() {
  const { recordId: rawParam } = useLocalSearchParams();
  const paramId = rawParam ? parseInt(rawParam, 10) : null;
  const router = useRouter();

  const sessionId = getSessionRecordId();
  const [recordId, setRecordId] = useState(paramId || sessionId);

  // Estado del expediente
  const [status, setStatus] = useState('pending');
  const isLocked = status === 'saved';

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
    setStability(''); setPatientColor(''); setAirway(''); setDecompression(''); setSide('');
    setCervical(''); setVentilatoryHelp(''); setOxygenTherapy(''); setHemorrhageCtrl('');
    setSolutionType(''); setRcp(''); setRecordId(null); setStatus('pending');
  };
  useFocusEffect(useCallback(() => {
    if (getSessionRecordId() === null) clearForm();
  }, [sessionId]));

  // Inicializa BD, stubs y carga datos previos + status
  useEffect(() => {
    (async () => {
      await initDatabase();
      const id = paramId || getSessionRecordId();
      if (!id) return;
      setRecordId(id);
      await createAllStubs(id);

      const rec = await getRecordById(id);
      if (rec && rec.status) setStatus(rec.status);

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

  // Botón único: “Siguiente” (guarda como borrador y avanza)
  const handleNext = async () => {
    if (isLocked) {
      Alert.alert('Expediente finalizado', 'Este expediente ya está firmado y no puede editarse.');
      return;
    }

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
      }, 'pending'); // ← borrador
      await createAllStubs(id);
      setSessionRecordId(id);
      setRecordId(id);
    } else {
      await updateRecord(id, { status: 'pending' }); // ← asegúrate que quede en borrador
      setStatus('pending');
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

    Alert.alert('Guardado', `Condición del paciente ID ${id} → borrador`);
    router.push({ pathname: '/PatientTransferScreen', params: { recordId: id } });
  };

  return (
    <ScrollView contentContainerStyle={styles.container} nestedScrollEnabled>
      <Text style={styles.title}>Condición del Paciente</Text>
      <Text style={styles.subtitle}>Expediente médico</Text>
      <Image style={styles.image} source={require('../assets/doctor.png')} />

      <CustomPicker label="Se encuentra estable"      selectedValue={stability}       onValueChange={setStability}       options={stabilityItems}       enabled={!isLocked} />
      <CustomPicker label="Color del paciente"        selectedValue={patientColor}    onValueChange={setPatientColor}    options={patientColors}        enabled={!isLocked} />
      <CustomPicker label="Vía aérea"                 selectedValue={airway}          onValueChange={setAirway}          options={airways}              enabled={!isLocked} />
      <CustomPicker label="Descompresión pleural"     selectedValue={decompression}   onValueChange={setDecompression}   options={decompressionItems}   enabled={!isLocked} />
      <CustomPicker label="Lado"                      selectedValue={side}            onValueChange={setSide}            options={sides}                enabled={!isLocked} />
      <CustomPicker label="Control cervical"          selectedValue={cervical}        onValueChange={setCervical}        options={cervicals}            enabled={!isLocked} />
      <CustomPicker label="Asistencia ventilatoria"   selectedValue={ventilatoryHelp} onValueChange={setVentilatoryHelp} options={ventilatoryHelpItems} enabled={!isLocked} />
      <CustomPicker label="Oxigenoterapia"            selectedValue={oxygenTherapy}   onValueChange={setOxygenTherapy}   options={oxygenTherapyItems}   enabled={!isLocked} />
      <CustomPicker label="Control de hemorragías"    selectedValue={hemorrhageCtrl}  onValueChange={setHemorrhageCtrl}  options={hemorrhageItems}      enabled={!isLocked} />
      <CustomPicker label="Tipo de soluciones"        selectedValue={solutionType}    onValueChange={setSolutionType}    options={solutionTypes}        enabled={!isLocked} />
      <CustomPicker label="RCP"                       selectedValue={rcp}             onValueChange={setRcp}             options={rcps}                 enabled={!isLocked} />

      {!isLocked && (
        <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
          <Text style={styles.buttonText}>Siguiente</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container:     { padding:20, alignItems:'center', backgroundColor:'#f5f5f5' },
  title:         { fontSize:24, fontWeight:'bold', marginBottom:10 },
  subtitle:      { fontSize:18, fontWeight:'600', color:'#555', marginBottom:20 },
  image:         { width:100, height:100, marginBottom:20, borderRadius:8 },
  nextButton:    { backgroundColor:'#1f9aef', padding:12, borderRadius:8, width:'100%', marginTop:20 },
  buttonText:    { color:'#fff', textAlign:'center', fontWeight:'bold' }
});
