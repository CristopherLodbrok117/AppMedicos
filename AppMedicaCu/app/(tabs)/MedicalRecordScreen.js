// app/screens/MedicalRecordScreen.js
import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Image, Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';

import FloatingLabelInput from '../components/FloatingLabelInput';
import CustomPicker       from '../components/CustomPicker';
import DatePicker         from '../components/DatePicker';

import {
  initDatabase,
  insertRecord,
  updateRecord,
  getRecordById,
  createAllStubs,
  getSessionRecordId,
  setSessionRecordId
} from '../../services/database';

export default function MedicalRecordScreen() {
  const router = useRouter();
  const { recordId: rawParam } = useLocalSearchParams();
  const paramId = rawParam ? parseInt(rawParam, 10) : null;

  const sessionId = getSessionRecordId();
  const [recordId, setRecordId] = useState(paramId || sessionId || null);

  const [date, setDate]         = useState(new Date());
  const [status, setStatus]     = useState('pending');
  const isLocked = status === 'saved';

  const [weekDay, setWeekDay]   = useState('');
  const [attentionReason, setAttentionReason] = useState('');
  const [serviceLocation, setServiceLocation] = useState('');
  const [vehicleType, setVehicleType]         = useState('');
  const [vehicleNum, setVehicleNum]           = useState('');
  const [operator, setOperator]               = useState('');
  const [intern, setIntern]                   = useState('');
  const [moreInterns, setMoreInterns]         = useState('');
  const [affiliation, setAffiliation]         = useState('');
  const [gender, setGender]                   = useState('');
  const [age, setAge]                         = useState('');
  const [address, setAddress]                 = useState('');
  const [colony, setColony]                   = useState('');
  const [municipality, setMunicipality]       = useState('');
  const [phone, setPhone]                     = useState('');
  const [rightful, setRightful]               = useState('');

  // NUEVOS
  const [belongsToUniNet, setBelongsToUniNet] = useState('No'); // Sí/No (UI)
  const [adscription, setAdscription]         = useState('');
  const [code, setCode]                       = useState('');

  const [weekDayAuto, setWeekDayAuto] = useState(true);

  const weekDays         = ['Lunes','Martes','Miércoles','Jueves','Viernes','Sábado','Domingo'];
  const attentionReasons = ['Enfermedad','Traumatismo','Gineco obstétrico'];
  const serviceLocations = ['Cucei','Inst. Dep.','Politécnico','Vocacional','Prepa 12','Via pública'];
  const vehicleTypes     = ['Vehiculo oficial','Cuatrimoto','Ambulancia','Ambulancia eléctrica','Otro'];
  const operators        = ['Javier Iñiguez','Rodrigo Guitierrez','Yair Villagrana','Jesús Hernandez','Jaime Juárez','Aida García'];
  const interns          = operators;
  const genders          = ['Masculino','Femenino'];
  const yesNo            = ['Sí','No'];

  const weekDayFromDate = (d) => {
    const idx = (d.getDay() + 6) % 7;
    return weekDays[idx];
  };
  const computeDefaults = (d) => ({
    weekDay: weekDayFromDate(d),
    attentionReason: attentionReasons[1] || attentionReasons[0],
    serviceLocation: serviceLocations[0],
    vehicleType:     vehicleTypes[0],
    operator:        operators[0],
    intern:          interns[0],
    gender:          genders[0],
    belongsToUniNet: 'No',
  });
  const coalesce = (val, def) => (val !== undefined && val !== null && val !== '' ? val : def);

  // “Nuevo” desde índice
  useFocusEffect(useCallback(() => {
    if (getSessionRecordId() === null && paramId === null) {
      const d = new Date();
      const DEF = computeDefaults(d);

      setRecordId(null);
      setDate(d);
      setStatus('pending');
      setWeekDay(DEF.weekDay);
      setAttentionReason(DEF.attentionReason);
      setServiceLocation(DEF.serviceLocation);
      setVehicleType(DEF.vehicleType);
      setVehicleNum('');
      setOperator(DEF.operator);
      setIntern(DEF.intern);
      setMoreInterns('');
      setAffiliation('');
      setGender(DEF.gender);
      setAge('');
      setAddress('');
      setColony('');
      setMunicipality('');
      setPhone('');
      setRightful('');
      // nuevos
      setBelongsToUniNet(DEF.belongsToUniNet);
      setAdscription('');
      setCode('');
      setWeekDayAuto(true);
    }
  }, [paramId]));

  // sincroniza día con la fecha
  useEffect(() => {
    if (weekDayAuto) setWeekDay(weekDayFromDate(date));
  }, [date, weekDayAuto]);

  // carga registro existente
  useEffect(() => {
    initDatabase();
    const id = paramId || getSessionRecordId();
    if (!id) {
      if (!weekDay) {
        const DEF = computeDefaults(date);
        setWeekDay(DEF.weekDay);
        setAttentionReason(DEF.attentionReason);
        setServiceLocation(DEF.serviceLocation);
        setVehicleType(DEF.vehicleType);
        setOperator(DEF.operator);
        setIntern(DEF.intern);
        setGender(DEF.gender);
        setBelongsToUniNet(DEF.belongsToUniNet);
        setWeekDayAuto(true);
      }
      return;
    }
    getRecordById(id).then((rec) => {
      if (!rec) return;
      setRecordId(id);
      setDate(new Date(`${rec.date}T${rec.time}`));
      setStatus(rec.status || 'pending');
      setWeekDay(rec.weekDay);
      setAttentionReason(rec.attentionReason);
      setServiceLocation(rec.serviceLocation);
      setVehicleType(rec.vehicleType);
      setVehicleNum(rec.vehicleNum);
      setOperator(rec.operator);
      setIntern(rec.intern);
      setMoreInterns(rec.moreInterns);
      setAffiliation(rec.affiliation);
      setGender(rec.gender);
      setAge(rec.age);
      setAddress(rec.address);
      setColony(rec.colony);
      setMunicipality(rec.municipality);
      setPhone(rec.phone);
      setRightful(rec.rightful);

      // nuevos (DB guarda 'Si'/'No' sin tilde idealmente)
      setBelongsToUniNet(rec.belongsToUniNet === 'Si' ? 'Sí' : (rec.belongsToUniNet || 'No'));
      setAdscription(rec.adscription || '');
      setCode(rec.code || '');

      setWeekDayAuto(false);
    });
  }, [paramId, sessionId]);

  // guardar + navegar
  const handleNext = async () => {
    if (isLocked) {
      Alert.alert('Expediente finalizado', 'Este expediente ya está firmado y no puede editarse.');
      return;
    }

    const dateStr = date.toISOString().slice(0,10);
    const timeStr = date.toTimeString().slice(0,8);
    const DEF = computeDefaults(date);

    const rec = {
      date: dateStr,
      time: timeStr,
      weekDay:         coalesce(weekDay,         DEF.weekDay),
      attentionReason: coalesce(attentionReason, DEF.attentionReason),
      serviceLocation: coalesce(serviceLocation, DEF.serviceLocation),
      vehicleType:     coalesce(vehicleType,     DEF.vehicleType),
      vehicleNum,
      operator:        coalesce(operator,        DEF.operator),
      intern:          coalesce(intern,          DEF.intern),
      moreInterns,
      affiliation,
      gender:          coalesce(gender,          DEF.gender),
      age,
      address,
      colony,
      municipality,
      phone,
      rightful,

      // nuevos
      belongsToUniNet: (belongsToUniNet === 'Sí' ? 'Si' : 'No'),
      adscription,
      code,

      status: 'pending',
    };

    let id = recordId;
    if (!id) {
      id = await insertRecord(rec, 'pending');
      await createAllStubs(id);
      setSessionRecordId(id);
      setRecordId(id);
    } else {
      await updateRecord(id, rec);
      setStatus('pending');
    }

    Alert.alert('Guardado', `Expediente ID: ${id}`);
    router.push({ pathname: '/PatientEvaluationScreen', params: { recordId: id } });
  };

  return (
    <View style={{ flex:1 }}>
      <ScrollView contentContainerStyle={s.container} nestedScrollEnabled>
        <Text style={s.title}>Expediente Médico</Text>
        <Image style={s.image} source={require('../assets/doctor.png')} />

        <View style={s.badgeWrap}>
          <Text style={[s.badge, isLocked ? s.badgeSaved : s.badgePending]}>
            {isLocked ? 'Finalizado' : 'En progreso'}
          </Text>
        </View>

        <View style={s.dateArea}>
          <DatePicker date={date} setDate={isLocked ? () => {} : setDate} title="Fecha de hoy" withTime />
        </View>

        <Text style={s.sectionTitle}>Ingrese los siguientes datos</Text>

        <CustomPicker
          label="Día de la semana"
          selectedValue={weekDay}
          onValueChange={(v) => { if (!isLocked) { setWeekDay(v); setWeekDayAuto(false); } }}
          options={weekDays}
          enabled={!isLocked}
        />

        <CustomPicker
          label="Motivo de la atención"
          selectedValue={attentionReason}
          onValueChange={(v) => !isLocked && setAttentionReason(v)}
          options={attentionReasons}
          enabled={!isLocked}
        />

        <CustomPicker
          label="Ubicación del servicio"
          selectedValue={serviceLocation}
          onValueChange={(v) => !isLocked && setServiceLocation(v)}
          options={serviceLocations}
          enabled={!isLocked}
        />

        <CustomPicker
          label="Vehículo"
          selectedValue={vehicleType}
          onValueChange={(v) => !isLocked && setVehicleType(v)}
          options={vehicleTypes}
          enabled={!isLocked}
        />

        {vehicleType === 'Otro' && (
          <TextInput
            style={s.input}
            placeholder="Especificar otro"
            value={vehicleNum}
            onChangeText={(t) => !isLocked && setVehicleNum(t)}
            editable={!isLocked}
          />
        )}

        <FloatingLabelInput label="Número de vehículo" iconName="directions-car" value={vehicleNum} onChangeText={(t)=>!isLocked&&setVehicleNum(t)} editable={!isLocked} />
        <CustomPicker label="Operador" selectedValue={operator} onValueChange={(v)=>!isLocked&&setOperator(v)} options={operators} enabled={!isLocked} />
        <CustomPicker label="Prestador de servicio" selectedValue={intern} onValueChange={(v)=>!isLocked&&setIntern(v)} options={interns} enabled={!isLocked} />
        <FloatingLabelInput label="Otros prestadores" iconName="groups" value={moreInterns} onChangeText={(t)=>!isLocked&&setMoreInterns(t)} editable={!isLocked} />
        <FloatingLabelInput label="Media filiación" iconName="face" value={affiliation} onChangeText={(t)=>!isLocked&&setAffiliation(t)} editable={!isLocked} />
        <CustomPicker label="Género" selectedValue={gender} onValueChange={(v)=>!isLocked&&setGender(v)} options={genders} enabled={!isLocked} />
        <FloatingLabelInput label="Edad" iconName="person" value={age} onChangeText={(t)=>!isLocked&&setAge(t)} editable={!isLocked} />
        <FloatingLabelInput label="Domicilio" iconName="home" value={address} onChangeText={(t)=>!isLocked&&setAddress(t)} editable={!isLocked} />
        <FloatingLabelInput label="Colonia" iconName="location-city" value={colony} onChangeText={(t)=>!isLocked&&setColony(t)} editable={!isLocked} />
        <FloatingLabelInput label="Municipio" iconName="location-city" value={municipality} onChangeText={(t)=>!isLocked&&setMunicipality(t)} editable={!isLocked} />
        <FloatingLabelInput label="Teléfono" iconName="phone-android" value={phone} onChangeText={(t)=>!isLocked&&setPhone(t)} editable={!isLocked} />
        <FloatingLabelInput label="Derechohabiente a" iconName="person-add-alt" value={rightful} onChangeText={(t)=>!isLocked&&setRightful(t)} editable={!isLocked} />

        {/* NUEVOS (debajo de Derechohabiente) */}
        <CustomPicker
          label="Pertenece a la Red Universitaria"
          selectedValue={belongsToUniNet}
          onValueChange={(v) => !isLocked && setBelongsToUniNet(v)}
          options={yesNo}
          enabled={!isLocked}
        />
        <FloatingLabelInput
          label="Adscripción"
          iconName="badge"
          value={adscription}
          onChangeText={(t)=>!isLocked&&setAdscription(t)}
          editable={!isLocked}
        />
        <FloatingLabelInput
          label="Código"
          iconName="qr-code-2"
          value={code}
          onChangeText={(t)=>!isLocked&&setCode(t)}
          editable={!isLocked}
        />

        {!isLocked && (
          <TouchableOpacity style={s.nextButton} onPress={handleNext}>
            <Text style={s.buttonText}>Siguiente</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  container:     { padding:20, alignItems:'center', backgroundColor:'#f5f5f5' },
  title:         { fontSize:24, fontWeight:'bold', marginBottom:10 },
  image:         { width:100, height:100, marginBottom:10, borderRadius:8 },
  badgeWrap:     { width:'100%', marginBottom:6, alignItems:'flex-end' },
  badge:         { paddingVertical:4, paddingHorizontal:8, borderRadius:6, color:'#fff', fontWeight:'600' },
  badgePending:  { backgroundColor:'#6c757d' },
  badgeSaved:    { backgroundColor:'#28a745' },
  dateArea:      { width:'100%', marginVertical:10 },
  sectionTitle:  { fontSize:18, fontWeight:'bold', marginTop:10, marginBottom:6, alignSelf:'flex-start' },
  input:         { width:'100%', height:40, backgroundColor:'#fff', borderLeftWidth:4, borderLeftColor:'#20b2aa', paddingHorizontal:10, marginTop:10 },
  nextButton:    { backgroundColor:'#1f9aef', padding:12, borderRadius:8, marginTop:16, width:'100%' },
  buttonText:    { color:'#fff', textAlign:'center', fontWeight:'bold' },
});
