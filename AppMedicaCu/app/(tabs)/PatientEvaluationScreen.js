// app/(tabs)/PatientEvaluationScreen.js
import React, { useState, useEffect, useCallback } from 'react';
import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
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
  getRecordById,
  getSessionRecordId,
  setSessionRecordId
} from '../../services/database';

export default function PatientEvaluationScreen() {
  const router = useRouter();
  const { recordId: rawParam } = useLocalSearchParams();
  const paramId = rawParam ? parseInt(rawParam, 10) : null;

  // 👉 No congeles el ID leyendo la sesión aquí; se resuelve en foco siempre
  const [recordId, setRecordId] = useState(null);

  const [status, setStatus]   = useState('pending');
  const [gender, setGender]   = useState('');
  const isLocked = status === 'saved';

  // Campos “generales”
  const [traumaCause, setTraumaCause]           = useState('');
  const [otherTraumaCause, setOtherTraumaCause] = useState('');
  const [injuryMechanism, setInjuryMechanism]   = useState('');
  const [clinicalCause, setClinicalCause]       = useState('');
  const [otherClinicalCause, setOtherClinicalCause] = useState('');
  const [specificCause, setSpecificCause]       = useState('');

  // Parto / RN
  const [deliveryProduct, setDeliveryProduct]   = useState('');
  const [deliverySex, setDeliverySex]           = useState('');

  // APGAR
  const [apgar1, setApgar1]   = useState('');
  const [apgar5, setApgar5]   = useState('');
  const [apgar10, setApgar10] = useState('');

  // Obstétricos
  const [gesta, setGesta]         = useState('');
  const [para, setPara]           = useState('');
  const [cesarean, setCesarean]   = useState('');
  const [abortion, setAbortion]   = useState('');

  // Fechas obstétricas
  const [lastCycleDate, setLastCycleDate] = useState(null); // LMP
  const [birthDate, setBirthDate]         = useState(null); // EDD

  // Solo UI
  const [eligibleDelivery, setEligibleDelivery] = useState('No');

  // Parámetros RN
  const [paramColor, setParamColor]       = useState('No aplica');
  const [paramHR, setParamHR]             = useState('No aplica');
  const [paramTone, setParamTone]         = useState('No aplica');
  const [paramStimuli, setParamStimuli]   = useState('No aplica');
  const [paramResp, setParamResp]         = useState('No aplica');

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
  const yesNo    = ['No','Sí'];

  const optsColor = [
    'No aplica',
    'Azul pálido',
    'Cuerpo rosa, manos y pies azul',
    'Completamente rosa',
  ];
  const optsHR = ['No aplica','Ausente','Lento (<100)','Arriba de 100'];
  const optsTone = ['No aplica','Flácido','Algo de flexibilidad en extremidades','Movimiento activo'];
  const optsStimuli = ['No aplica','Ausente','Algo de movimiento, llanto','Llanto vigoroso'];
  const optsResp = ['No aplica','Ausente','Lento e irregular','Bueno, llanto'];

  const computeDefaults = () => ({
    traumaCause: 'Otro',
    clinicalCause: 'Otro',
    deliveryProduct: 'No aplica',
    deliverySex: 'No aplica',
  });
  const coalesce = (v, d) => (v !== undefined && v !== null && v !== '' ? v : d);
  const nonAppliesToNull = (v) => (v && v !== 'No aplica' ? v : null);

  const clearForm = () => {
    setTraumaCause(''); setOtherTraumaCause(''); setInjuryMechanism('');
    setClinicalCause(''); setOtherClinicalCause(''); setSpecificCause('');
    setDeliveryProduct(''); setDeliverySex('');
    setApgar1(''); setApgar5(''); setApgar10('');
    setGesta(''); setPara(''); setCesarean(''); setAbortion('');
    setLastCycleDate(null); setBirthDate(null);
    setEligibleDelivery('No');
    setParamColor('No aplica'); setParamHR('No aplica'); setParamTone('No aplica');
    setParamStimuli('No aplica'); setParamResp('No aplica');
  };

  // 🔁 Al enfocar: sesión manda (como recursos.js). Si cambia, limpiamos y cargamos.
  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      (async () => {
        await initDatabase();

        const sid = getSessionRecordId();    // ← fuente de verdad
        const effectiveId = (sid ?? paramId) ?? null;

        if (!effectiveId) {
          clearForm();
          setRecordId(null);
          setStatus('pending');
          setGender('');
          return;
        }

        if (recordId !== effectiveId) {
          clearForm();
          setRecordId(effectiveId);
        }

        await createAllStubs(effectiveId);

        const rec = await getRecordById(effectiveId);
        if (!cancelled && rec) {
          setStatus(rec.status || 'pending');
          setGender(rec.gender || '');
        }

        const prev = await getPatientEvaluationById(effectiveId);
        if (!cancelled) {
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

            setLastCycleDate(prev.lastCycleDate ? new Date(prev.lastCycleDate) : null);
            if (prev.birthDate) {
              setBirthDate(new Date(prev.birthDate));
              setEligibleDelivery('Sí');
            } else {
              setBirthDate(null);
              setEligibleDelivery('No');
            }

            setParamColor(prev.paramColoracion || 'No aplica');
            setParamHR(prev.paramFrecuenciaCardiaca || 'No aplica');
            setParamTone(prev.paramTonoMuscular || 'No aplica');
            setParamStimuli(prev.paramRespuestaEstimulos || 'No aplica');
            setParamResp(prev.paramEsfuerzoRespiratorio || 'No aplica');
          } else {
            const DEF = computeDefaults();
            setTraumaCause(DEF.traumaCause);
            setClinicalCause(DEF.clinicalCause);
            setDeliveryProduct(DEF.deliveryProduct);
            setDeliverySex(DEF.deliverySex);
            setApgar1(''); setApgar5(''); setApgar10('');
            setGesta(''); setPara(''); setCesarean(''); setAbortion('');
            setLastCycleDate(null); setBirthDate(null); setEligibleDelivery('No');
            setParamColor('No aplica'); setParamHR('No aplica'); setParamTone('No aplica');
            setParamStimuli('No aplica'); setParamResp('No aplica');
          }
        }
      })();
      return () => { cancelled = true; };
    }, [paramId, recordId])
  );

  // Mostrar LMP si género Femenino; EDD y parámetros si elegible
  const showLMP = gender === 'Femenino';
  const showEDDandParams = showLMP && eligibleDelivery === 'Sí';

  const handleNext = async () => {
    if (isLocked) {
      Alert.alert('Expediente finalizado', 'Este expediente ya está firmado y no puede editarse.');
      return;
    }

    // ⚠️ Usa SIEMPRE el ID efectivo (sesión > param > estado local)
    let id = getSessionRecordId() ?? paramId ?? recordId ?? null;

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
      }, 'pending');
      await createAllStubs(id);
      setSessionRecordId(id); // ← fijamos la sesión al nuevo ID
      setRecordId(id);
    } else {
      await updateRecord(id, { status: 'pending' });
    }

    const DEF = computeDefaults();

    await updatePatientEvaluation(id, {
      traumaCause:      coalesce(traumaCause,      DEF.traumaCause),
      otherTraumaCause,
      injuryMechanism,
      clinicalCause:    coalesce(clinicalCause,    DEF.clinicalCause),
      otherClinicalCause,
      specificCause,
      deliveryProduct:  coalesce(deliveryProduct,  DEF.deliveryProduct),
      deliverySex:      coalesce(deliverySex,      DEF.deliverySex),
      apgarMinute1:     apgar1,
      apgarMinute5:     apgar5,
      apgarMinute10:    apgar10,
      gesta, para, cesarean, abortion,

      // Fechas
      lastCycleDate: showLMP && lastCycleDate ? lastCycleDate.toISOString().slice(0,10) : null,
      birthDate:     showEDDandParams && birthDate ? birthDate.toISOString().slice(0,10) : null,

      // Parámetros RN (NULL si "No aplica")
      paramColoracion:           showEDDandParams ? nonAppliesToNull(paramColor)     : null,
      paramFrecuenciaCardiaca:   showEDDandParams ? nonAppliesToNull(paramHR)        : null,
      paramTonoMuscular:         showEDDandParams ? nonAppliesToNull(paramTone)      : null,
      paramRespuestaEstimulos:   showEDDandParams ? nonAppliesToNull(paramStimuli)   : null,
      paramEsfuerzoRespiratorio: showEDDandParams ? nonAppliesToNull(paramResp)      : null,
    });

    Alert.alert('Guardado', `Evaluación guardada (ID ${id})`);
    router.push({ pathname: '/FirstEvaluationScreen', params: { recordId: id } });
  };

  return (
    <ScrollView contentContainerStyle={s.container} nestedScrollEnabled>
      <Text style={s.title}>Evaluación del Paciente</Text>
      <Image style={s.image} source={require('../assets/doctor.png')} />

      <View style={s.badgeWrap}>
        <Text style={[s.badge, isLocked ? s.badgeSaved : s.badgePending]}>
          {isLocked ? 'Finalizado' : 'Borrador'}
        </Text>
      </View>

      <CustomPicker
        label="Causa traumática"
        selectedValue={traumaCause}
        onValueChange={(v)=>!isLocked && setTraumaCause(v)}
        options={traumaCauses}
        enabled={!isLocked}
      />
      <FloatingLabelInput label="Si otro, indique cuál" iconName="personal-injury"
        value={otherTraumaCause} onChangeText={(t)=>!isLocked && setOtherTraumaCause(t)} editable={!isLocked}
      />
      <FloatingLabelInput label="Mecanismo de lesión" iconName="healing"
        value={injuryMechanism} onChangeText={(t)=>!isLocked && setInjuryMechanism(t)} editable={!isLocked}
      />
      <CustomPicker
        label="Causa clínica"
        selectedValue={clinicalCause}
        onValueChange={(v)=>!isLocked && setClinicalCause(v)}
        options={clinicCauses}
        enabled={!isLocked}
      />
      <FloatingLabelInput label="Si otro, indique cuál" iconName="domain"
        value={otherClinicalCause} onChangeText={(t)=>!isLocked && setOtherClinicalCause(t)} editable={!isLocked}
      />
      <FloatingLabelInput label="Causa específica" iconName="medical-services"
        value={specificCause} onChangeText={(t)=>!isLocked && setSpecificCause(t)} editable={!isLocked}
      />

      <Text style={s.sectionTitle}>Información de parto</Text>
      <CustomPicker
        label="Producto"
        selectedValue={deliveryProduct}
        onValueChange={(v)=>!isLocked && setDeliveryProduct(v)}
        options={products}
        enabled={!isLocked}
      />
      <CustomPicker
        label="Sexo"
        selectedValue={deliverySex}
        onValueChange={(v)=>!isLocked && setDeliverySex(v)}
        options={sexes}
        enabled={!isLocked}
      />

      <Text style={s.sectionTitle}>APGAR</Text>
      <FloatingLabelInput label="Minuto 1" iconName="access-time" keyboardType="numeric"
        value={apgar1} onChangeText={(t)=>!isLocked&&setApgar1(t)} editable={!isLocked}
      />
      <FloatingLabelInput label="Minuto 5" iconName="access-time" keyboardType="numeric"
        value={apgar5} onChangeText={(t)=>!isLocked&&setApgar5(t)} editable={!isLocked}
      />
      <FloatingLabelInput label="Minuto 10" iconName="access-time" keyboardType="numeric"
        value={apgar10} onChangeText={(t)=>!isLocked&&setApgar10(t)} editable={!isLocked}
      />

      <FloatingLabelInput label="Gesta" iconName="view-list" keyboardType="numeric"
        value={gesta} onChangeText={(t)=>!isLocked&&setGesta(t)} editable={!isLocked}
      />
      <FloatingLabelInput label="Para" iconName="pregnant-woman" keyboardType="numeric"
        value={para} onChangeText={(t)=>!isLocked&&setPara(t)} editable={!isLocked}
      />
      <FloatingLabelInput label="Cesárea" iconName="pregnant-woman" keyboardType="numeric"
        value={cesarean} onChangeText={(t)=>!isLocked&&setCesarean(t)} editable={!isLocked}
      />
      <FloatingLabelInput label="Aborto" iconName="cancel" keyboardType="numeric"
        value={abortion} onChangeText={(t)=>!isLocked&&setAbortion(t)} editable={!isLocked}
      />

      {/* Obstétrico (según indicación) */}
      {gender === 'Femenino' && (
        <View style={s.dateArea}>
          <DatePicker
            date={lastCycleDate || new Date()}
            setDate={(d)=>!isLocked && setLastCycleDate(d)}
            title="Fecha última de menstruación"
            withTime={false}
          />
        </View>
      )}

      {gender === 'Femenino' && (
        <CustomPicker
          label="Elegible para parto"
          selectedValue={eligibleDelivery}
          onValueChange={(v)=>!isLocked && setEligibleDelivery(v)}
          options={yesNo}
          enabled={!isLocked}
        />
      )}

      {gender === 'Femenino' && eligibleDelivery === 'Sí' && (
        <>
          <View style={s.dateArea}>
            <DatePicker
              date={birthDate || new Date()}
              setDate={(d)=>!isLocked && setBirthDate(d)}
              title="Fecha probable de parto"
              withTime={false}
            />
          </View>

          <Text style={s.sectionTitle}>Parámetros del recién nacido</Text>
          <CustomPicker label="Coloración" selectedValue={paramColor}
            onValueChange={(v)=>!isLocked && setParamColor(v)} options={optsColor} enabled={!isLocked}
          />
          <CustomPicker label="Frecuencia cardíaca" selectedValue={paramHR}
            onValueChange={(v)=>!isLocked && setParamHR(v)} options={optsHR} enabled={!isLocked}
          />
          <CustomPicker label="Tono muscular" selectedValue={paramTone}
            onValueChange={(v)=>!isLocked && setParamTone(v)} options={optsTone} enabled={!isLocked}
          />
          <CustomPicker label="Respuesta a estímulos" selectedValue={paramStimuli}
            onValueChange={(v)=>!isLocked && setParamStimuli(v)} options={optsStimuli} enabled={!isLocked}
          />
          <CustomPicker label="Esfuerzo respiratorio" selectedValue={paramResp}
            onValueChange={(v)=>!isLocked && setParamResp(v)} options={optsResp} enabled={!isLocked}
          />
        </>
      )}

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
  badgeWrap:     { width:'100%', marginBottom:6, alignItems:'flex-end' },
  badge:         { paddingVertical:4, paddingHorizontal:8, borderRadius:6, color:'#fff', fontWeight:'600' },
  badgePending:  { backgroundColor:'#6c757d' },
  badgeSaved:    { backgroundColor:'#28a745' },
  sectionTitle:  { fontSize:18, fontWeight:'bold', marginTop:20, marginBottom:10, alignSelf:'flex-start' },
  dateArea:      { width:'100%', marginVertical:10 },
  nextButton:    { backgroundColor:'#1f9aef', padding:12, borderRadius:8, marginTop:16, width:'100%' },
  buttonText:    { color:'#fff', textAlign:'center', fontWeight:'bold' },
});
