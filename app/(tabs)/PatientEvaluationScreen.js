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
  getRecordById,            // <-- para leer género y status del expediente
  getSessionRecordId,
  setSessionRecordId
} from '../../services/database';

export default function PatientEvaluationScreen() {
  const router = useRouter();
  const { recordId: rawParam } = useLocalSearchParams();
  const paramId = rawParam ? parseInt(rawParam, 10) : null;

  // ID de expediente (prioriza parámetro; si no, sesión)
  const [recordId, setRecordId] = useState(paramId || getSessionRecordId() || null);

  // Estado del expediente y datos base (p/ bloquear y lógica de género)
  const [status, setStatus]   = useState('pending');
  const [gender, setGender]   = useState(''); // viene de records
  const isLocked = status === 'saved';

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

  // ⚠️ No precargamos fechas; solo cuando aplique el caso
  const [lastCycleDate, setLastCycleDate]       = useState(null); // Date | null
  const [birthDate, setBirthDate]               = useState(null); // Date | null

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

  // Defaults que quieres que cuenten aunque no toquen los pickers
  const computeDefaults = () => ({
    traumaCause:  'Otro',
    clinicalCause:'Otro',
    deliveryProduct: 'No aplica',
    deliverySex:     'No aplica',
  });
  const coalesce = (val, def) => (val !== undefined && val !== null && val !== '' ? val : def);

  // Para un caso "Nuevo" desde el índice (sesión anulada)
  const clearForm = () => {
    setTraumaCause(''); setOtherTraumaCause(''); setInjuryMechanism('');
    setClinicalCause(''); setOtherClinicalCause(''); setSpecificCause('');
    setDeliveryProduct(''); setDeliverySex('');
    setApgar1(''); setApgar5(''); setApgar10('');
    setGesta(''); setPara(''); setCesarean(''); setAbortion('');
    setLastCycleDate(null); setBirthDate(null);
  };

  useFocusEffect(useCallback(() => {
    if (getSessionRecordId() === null && paramId === null) {
      clearForm();
      setRecordId(null);
      setStatus('pending');
      setGender('');
    }
  }, [paramId]));

  // Carga de datos (expediente y evaluación previa)
  useEffect(() => {
    (async () => {
      await initDatabase();
      const id = paramId || getSessionRecordId();
      if (!id) return;

      setRecordId(id);
      await createAllStubs(id);

      // Lee expediente para status/género
      const rec = await getRecordById(id);
      if (rec) {
        setStatus(rec.status || 'pending');
        setGender(rec.gender || '');
      }

      // Lee evaluación previa
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
        // Fechas gineco: sólo setear si existen guardadas previamente
        if (prev.lastCycleDate) setLastCycleDate(new Date(prev.lastCycleDate));
        if (prev.birthDate)     setBirthDate(new Date(prev.birthDate));
      } else {
        // Si no hay data previa y quieres que se "vea" un default en UI, puedes setearlos aquí:
        const DEF = computeDefaults();
        setTraumaCause(DEF.traumaCause);
        setClinicalCause(DEF.clinicalCause);
        setDeliveryProduct(DEF.deliveryProduct);
        setDeliverySex(DEF.deliverySex);
      }
    })();
  }, [paramId]);

  // Mostrar campos gineco solo si aplica
  const showGyn = (gender === 'Femenino') &&
                  (clinicalCause === 'Gineco obstétrica' || (deliveryProduct && deliveryProduct !== 'No aplica'));

  // Guardar como "pending" y navegar (flujo intermedio)
  const handleNext = async () => {
    if (!recordId) {
      // edge case: si llegaron directo a esta screen sin crear expediente
      const now = new Date();
      const id = await insertRecord({
        date: now.toISOString().slice(0,10),
        time: now.toTimeString().slice(0,8),
        weekDay:'', attentionReason:'', serviceLocation:'',
        vehicleType:'', vehicleNum:'', operator:'', intern:'',
        moreInterns:'', affiliation:'', gender:'',
        age:'', address:'', colony:'', municipality:'',
        phone:'', rightful:''
      }, 'pending');
      await createAllStubs(id);
      setSessionRecordId(id);
      setRecordId(id);
    } else {
      await updateRecord(recordId, { status: 'pending' });
    }

    // Garantiza que los defaults se guarden aunque el usuario no tocó los pickers
    const DEF = computeDefaults();

    await updatePatientEvaluation(recordId || getSessionRecordId(), {
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
      gesta,
      para,
      cesarean,
      abortion,
      // Fechas: solo guardar si aplica y si el usuario eligió fecha
      lastCycleDate: showGyn && lastCycleDate ? lastCycleDate.toISOString().slice(0,10) : null,
      birthDate:     showGyn && birthDate     ? birthDate.toISOString().slice(0,10)     : null,
    });

    Alert.alert('Guardado', `Evaluación guardada (ID ${recordId || getSessionRecordId()})`);

    // Navega al siguiente paso
    router.push({ pathname: '/FirstEvaluationScreen', params: { recordId: recordId || getSessionRecordId() } });
  };

  return (
    <ScrollView contentContainerStyle={s.container} nestedScrollEnabled>
      <Text style={s.title}>Evaluación del Paciente</Text>
      <Image style={s.image} source={require('../assets/doctor.png')} />

      {/* Estado visual */}
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
      <FloatingLabelInput
        label="Si otro, indique cuál"
        iconName="personal-injury"
        value={otherTraumaCause}
        onChangeText={(t)=>!isLocked && setOtherTraumaCause(t)}
        editable={!isLocked}
      />
      <FloatingLabelInput
        label="Mecanismo de lesión"
        iconName="healing"
        value={injuryMechanism}
        onChangeText={(t)=>!isLocked && setInjuryMechanism(t)}
        editable={!isLocked}
      />
      <CustomPicker
        label="Causa clínica"
        selectedValue={clinicalCause}
        onValueChange={(v)=>!isLocked && setClinicalCause(v)}
        options={clinicCauses}
        enabled={!isLocked}
      />
      <FloatingLabelInput
        label="Si otro, indique cuál"
        iconName="domain"
        value={otherClinicalCause}
        onChangeText={(t)=>!isLocked && setOtherClinicalCause(t)}
        editable={!isLocked}
      />
      <FloatingLabelInput
        label="Causa específica"
        iconName="medical-services"
        value={specificCause}
        onChangeText={(t)=>!isLocked && setSpecificCause(t)}
        editable={!isLocked}
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
      <FloatingLabelInput label="Minuto 1" iconName="access-time" keyboardType="numeric" value={apgar1} onChangeText={(t)=>!isLocked&&setApgar1(t)} editable={!isLocked} />
      <FloatingLabelInput label="Minuto 5" iconName="access-time" keyboardType="numeric" value={apgar5} onChangeText={(t)=>!isLocked&&setApgar5(t)} editable={!isLocked} />
      <FloatingLabelInput label="Minuto 10" iconName="access-time" keyboardType="numeric" value={apgar10} onChangeText={(t)=>!isLocked&&setApgar10(t)} editable={!isLocked} />

      <FloatingLabelInput label="Gesta" iconName="view-list" keyboardType="numeric" value={gesta} onChangeText={(t)=>!isLocked&&setGesta(t)} editable={!isLocked} />
      <FloatingLabelInput label="Para" iconName="pregnant-woman" keyboardType="numeric" value={para} onChangeText={(t)=>!isLocked&&setPara(t)} editable={!isLocked} />
      <FloatingLabelInput label="Cesárea" iconName="pregnant-woman" keyboardType="numeric" value={cesarean} onChangeText={(t)=>!isLocked&&setCesarean(t)} editable={!isLocked} />
      <FloatingLabelInput label="Aborto" iconName="cancel" keyboardType="numeric" value={abortion} onChangeText={(t)=>!isLocked&&setAbortion(t)} editable={!isLocked} />

      {/* Fechas gineco obstétricas: solo si aplica (no precargar por defecto) */}
      {showGyn && (
        <>
          <View style={s.dateArea}>
            <DatePicker
              date={lastCycleDate || new Date()} // el DatePicker suele requerir un Date; mostramos UI sin pre-guardar
              setDate={(d)=>!isLocked && setLastCycleDate(d)}
              title="Última fecha de menstruación"
              withTime={false}
            />
          </View>
          <View style={s.dateArea}>
            <DatePicker
              date={birthDate || new Date()}
              setDate={(d)=>!isLocked && setBirthDate(d)}
              title="Fecha probable de parto"
              withTime={false}
            />
          </View>
        </>
      )}

      {/* Botón único: Siguiente */}
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
