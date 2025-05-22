// app/(tabs)/PatientEvaluationScreen.js
import React, { useState, useEffect, useCallback } from 'react';
import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';

import FloatingLabelInput from '../components/FloatingLabelInput';
import CustomPicker       from '../components/CustomPicker';
import DatePicker         from '../components/DatePicker';

import {
  initDatabase,
  insertRecord,
  createAllStubs,
  updatePatientEvaluation,
  updateRecord,
  getPatientEvaluationById,
  getSessionRecordId,
  setSessionRecordId
} from '../../services/database';

export default function PatientEvaluationScreen() {
  const { recordId: rawParam } = useLocalSearchParams();
  const paramId = rawParam ? parseInt(rawParam, 10) : null;

  // Prioriza paramId, si no existe usa la sesión
  const [recordId, setRecordId] = useState(paramId || getSessionRecordId());

  // Campos de formulario
  const [traumaCause, setTraumaCause]           = useState('');
  const [otherTraumaCause, setOtherTraumaCause] = useState('');
  const [injuryMechanism, setInjuryMechanism]   = useState('');
  const [clinicalCause, setClinicalCause]       = useState('');
  const [otherClinicalCause, setOtherClinicalCause] = useState('');
  const [specificCause, setSpecificCause]       = useState('');
  const [deliveryProduct, setDeliveryProduct]   = useState('');
  const [deliverySex, setDeliverySex]           = useState('');
  const [apgar1, setApgar1]                     = useState('');
  const [apgar5, setApgar5]                     = useState('');
  const [apgar10, setApgar10]                   = useState('');
  const [gesta, setGesta]                       = useState('');
  const [para, setPara]                         = useState('');
  const [cesarean, setCesarean]                 = useState('');
  const [abortion, setAbortion]                 = useState('');
  const [lastCycleDate, setLastCycleDate]       = useState(new Date());
  const [birthDate, setBirthDate]               = useState(new Date());

  // Opciones para pickers
  const traumaCauses = [
    'Otro','Arma','Automotor','Maquinaria','Bicicleta','Herramienta',
    'Electricidad','Fuego','Sustancia caliente','Producto biológico',
    'Sustancia tóxica','Juguete','Explosión','Ser humano','Animal'
  ];
  const clinicCauses = [
    'Otro','Neurología','Cardiovascular','Respiratorio','Metabólico',
    'Digestiva','Urogenital','Gineco obstétrica','Psico emotiva',
    'Músculo esquelético','Infecciosa','Oncológico'
  ];
  const products = ['No aplica','Vivo','Muerto'];
  const sexes    = ['No aplica','Masculino','Femenino'];

  // Limpia todos los campos
  const clearForm = () => {
    setTraumaCause('');
    setOtherTraumaCause('');
    setInjuryMechanism('');
    setClinicalCause('');
    setOtherClinicalCause('');
    setSpecificCause('');
    setDeliveryProduct('');
    setDeliverySex('');
    setApgar1('');
    setApgar5('');
    setApgar10('');
    setGesta('');
    setPara('');
    setCesarean('');
    setAbortion('');
    setLastCycleDate(new Date());
    setBirthDate(new Date());
  };

  // ─── Sólo cuando el index hizo "Nuevo": sesión === null y paramId === null ───
  useFocusEffect(
  React.useCallback(() => {
    // Si la sesión ha quedado en null → limpiar TODO form y recordId local
    if (getSessionRecordId() === null) {
      clearForm();
      setRecordId(null);
    }
  }, [])
);
  // ──────────────────────────────────────────────────────────────────────────────

  // Montaje y siempre que cambie paramId: carga BD y datos previos si hay ID
  useEffect(() => {
    (async () => {
      await initDatabase();
      const id = paramId || getSessionRecordId();
      if (id) {
        setRecordId(id);
        await createAllStubs(id);
        const prev = await getPatientEvaluationById(id);
        if (prev) {
          setTraumaCause(prev.traumaCause  || '');
          setOtherTraumaCause(prev.otherTraumaCause  || '');
          setInjuryMechanism(prev.injuryMechanism  || '');
          setClinicalCause(prev.clinicalCause  || '');
          setOtherClinicalCause(prev.otherClinicalCause  || '');
          setSpecificCause(prev.specificCause  || '');
          setDeliveryProduct(prev.deliveryProduct  || '');
          setDeliverySex(prev.deliverySex  || '');
          setApgar1(prev.apgarMinute1  || '');
          setApgar5(prev.apgarMinute5  || '');
          setApgar10(prev.apgarMinute10  || '');
          setGesta(prev.gesta  || '');
          setPara(prev.para  || '');
          setCesarean(prev.cesarean  || '');
          setAbortion(prev.abortion  || '');
          if (prev.lastCycleDate) setLastCycleDate(new Date(prev.lastCycleDate));
          if (prev.birthDate)     setBirthDate(new Date(prev.birthDate));
        }
      }
    })();
  }, [paramId]);

  // Guardar / Terminar más tarde
  const onSave = async (statusLabel) => {
    let id = recordId;
    if (!id) {
      const now = new Date();
      id = await insertRecord({
        date: now.toISOString().slice(0,10),
        time: now.toTimeString().slice(0,8),
        weekDay:'', attentionReason:'', serviceLocation:'',
        vehicleType:'', vehicleNum:'', operator:'', intern:'',
        moreInterns:'', affiliation:'', gender:'',
        age:'', address:'', colony:'', municipality:'',
        phone:'', rightful:''
      }, statusLabel);
      await createAllStubs(id);
      setSessionRecordId(id);
      setRecordId(id);
    } else {
      await updateRecord(id, { status: statusLabel });
    }

    await updatePatientEvaluation(id, {
      traumaCause,
      otherTraumaCause,
      injuryMechanism,
      clinicalCause,
      otherClinicalCause,
      specificCause,
      deliveryProduct,
      deliverySex,
      apgarMinute1:  apgar1,
      apgarMinute5:  apgar5,
      apgarMinute10: apgar10,
      gesta,
      para,
      cesarean,
      abortion,
      lastCycleDate: lastCycleDate.toISOString().slice(0,10),
      birthDate:     birthDate.toISOString().slice(0,10),
    });

    Alert.alert(
      statusLabel === 'saved' ? 'Guardado' : 'Pendiente',
      `Evaluación ID ${id} → status: ${statusLabel}`
    );
  };

  return (
    <ScrollView contentContainerStyle={s.container} nestedScrollEnabled>
      <Text style={s.title}>Evaluación del Paciente</Text>
      <Image style={s.image} source={require('../assets/doctor.png')} />

      <CustomPicker
        label="Causa traumática"
        selectedValue={traumaCause}
        onValueChange={setTraumaCause}
        options={traumaCauses}
      />
      <FloatingLabelInput
        label="Si otro, indique cuál"
        iconName="personal-injury"
        value={otherTraumaCause}
        onChangeText={setOtherTraumaCause}
      />
      <FloatingLabelInput
        label="Mecanismo de lesión"
        iconName="healing"
        value={injuryMechanism}
        onChangeText={setInjuryMechanism}
      />
      <CustomPicker
        label="Causa clínica"
        selectedValue={clinicalCause}
        onValueChange={setClinicalCause}
        options={clinicCauses}
      />
      <FloatingLabelInput
        label="Si otro, indique cuál"
        iconName="domain"
        value={otherClinicalCause}
        onChangeText={setOtherClinicalCause}
      />
      <FloatingLabelInput
        label="Causa específica"
        iconName="medical-services"
        value={specificCause}
        onChangeText={setSpecificCause}
      />

      <Text style={s.sectionTitle}>Información de parto</Text>
      <CustomPicker
        label="Producto"
        selectedValue={deliveryProduct}
        onValueChange={setDeliveryProduct}
        options={products}
      />
      <CustomPicker
        label="Sexo"
        selectedValue={deliverySex}
        onValueChange={setDeliverySex}
        options={sexes}
      />

      <Text style={s.sectionTitle}>APGAR</Text>
      <FloatingLabelInput
        label="Minuto 1"
        iconName="access-time"
        keyboardType="numeric"
        value={apgar1}
        onChangeText={setApgar1}
      />
      <FloatingLabelInput
        label="Minuto 5"
        iconName="access-time"
        keyboardType="numeric"
        value={apgar5}
        onChangeText={setApgar5}
      />
      <FloatingLabelInput
        label="Minuto 10"
        iconName="access-time"
        keyboardType="numeric"
        value={apgar10}
        onChangeText={setApgar10}
      />

      <FloatingLabelInput
        label="Gesta"
        iconName="view-list"
        keyboardType="numeric"
        value={gesta}
        onChangeText={setGesta}
      />
      <FloatingLabelInput
        label="Para"
        iconName="pregnant-woman"
        keyboardType="numeric"
        value={para}
        onChangeText={setPara}
      />
      <FloatingLabelInput
        label="Cesárea"
        iconName="pregnant-woman"
        keyboardType="numeric"
        value={cesarean}
        onChangeText={setCesarean}
      />
      <FloatingLabelInput
        label="Aborto"
        iconName="cancel"
        keyboardType="numeric"
        value={abortion}
        onChangeText={setAbortion}
      />

      <View style={s.dateArea}>
        <DatePicker
          date={lastCycleDate}
          setDate={setLastCycleDate}
          title="Última fecha de menstruación"
          withTime={false}
        />
      </View>
      <View style={s.dateArea}>
        <DatePicker
          date={birthDate}
          setDate={setBirthDate}
          title="Fecha probable de parto"
          withTime={false}
        />
      </View>

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
  sectionTitle:  { fontSize:18, fontWeight:'bold', marginTop:20, marginBottom:10, alignSelf:'flex-start' },
  dateArea:      { width:'100%', marginVertical:10 },
  saveButton:    { backgroundColor:'#28a745', padding:12, borderRadius:8, marginTop:20, width:'100%' },
  pendingButton: { backgroundColor:'#6c757d', padding:12, borderRadius:8, marginTop:10, width:'100%' },
  buttonText:    { color:'#fff', textAlign:'center', fontWeight:'bold' },
});
