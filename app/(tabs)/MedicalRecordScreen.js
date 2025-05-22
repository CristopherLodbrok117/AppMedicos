import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Alert,
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
  const [recordId, setRecordId] = useState(paramId || sessionId);

  const [date, setDate]         = useState(new Date());
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

  const weekDays         = ['Lunes','Martes','Miércoles','Jueves','Viernes','Sábado','Domingo'];
  const attentionReasons = ['Enfermedad','Traumatismo','Gineco obstétrico'];
  const serviceLocations = ['Cucei','Inst. Dep.','Politécnico','Vocacional','Prepa 12','Via pública'];
  const vehicleTypes     = ['Vehiculo oficial','Cuatrimoto','Ambulancia','Ambulancia eléctrica','Otro'];
  const operators        = ['Javier Iñiguez','Rodrigo Guitierrez','Yair Villagrana','Jesús Hernandez','Jaime Juárez','Aida García'];
  const interns          = operators;
  const genders          = ['Masculino','Femenino'];

  // Al pulsar Nuevo en el index (sessionId pasa a null), limpiamos
  useFocusEffect(useCallback(() => {
    if (getSessionRecordId() === null && paramId === null) {
      setRecordId(null);
      setDate(new Date());
      setWeekDay('');
      setAttentionReason('');
      setServiceLocation('');
      setVehicleType('');
      setVehicleNum('');
      setOperator('');
      setIntern('');
      setMoreInterns('');
      setAffiliation('');
      setGender('');
      setAge('');
      setAddress('');
      setColony('');
      setMunicipality('');
      setPhone('');
      setRightful('');
    }
  }, [paramId]));

  // Cargamos el registro si paramId o sessionId cambian
  useEffect(() => {
    initDatabase();
    const id = paramId || getSessionRecordId();
    if (!id) return;
    getRecordById(id).then(rec => {
      if (!rec) return;
      setRecordId(id);
      setDate(new Date(`${rec.date}T${rec.time}`));
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
    });
  }, [paramId, sessionId]);

  const saveRecord = async (statusLabel) => {
    const dateStr = date.toISOString().slice(0,10);
    const timeStr = date.toTimeString().slice(0,8);
    const rec = {
      date: dateStr,
      time: timeStr,
      weekDay, attentionReason, serviceLocation,
      vehicleType, vehicleNum, operator,
      intern, moreInterns, affiliation,
      gender, age, address, colony,
      municipality, phone, rightful
    };

    let id = recordId;
    if (!id) {
      id = await insertRecord(rec, statusLabel);
      await createAllStubs(id);
      // **Importante**: fijamos sesión
      setSessionRecordId(id);
      setRecordId(id);
    } else {
      await updateRecord(id, { ...rec, status: statusLabel });
    }

    Alert.alert(
      statusLabel === 'saved' ? 'Guardado' : 'Pendiente',
      `Expediente ID: ${id}`
    );
    // vamos a PatientEvaluation con el mismo ID
    router.push({
      pathname: '/PatientEvaluationScreen',
      params: { recordId: id }
    });
  };

  return (
    <View style={{ flex:1 }}>
      <ScrollView contentContainerStyle={s.container} nestedScrollEnabled>
        <Text style={s.title}>Expediente Médico</Text>
        <Image style={s.image} source={require('../assets/doctor.png')} />

        <View style={s.dateArea}>
          <DatePicker date={date} setDate={setDate} title="Fecha de hoy" withTime />
        </View>

        <Text style={s.sectionTitle}>Ingrese los siguientes datos</Text>
        <CustomPicker label="Día de la semana" selectedValue={weekDay} onValueChange={setWeekDay} options={weekDays} />
        <CustomPicker label="Motivo de la atención" selectedValue={attentionReason} onValueChange={setAttentionReason} options={attentionReasons} />
        <CustomPicker label="Ubicación del servicio" selectedValue={serviceLocation} onValueChange={setServiceLocation} options={serviceLocations} />
        <CustomPicker label="Vehículo" selectedValue={vehicleType} onValueChange={setVehicleType} options={vehicleTypes} />

        {vehicleType === 'Otro' && (
          <TextInput
            style={s.input}
            placeholder="Especificar otro"
            value={vehicleNum}
            onChangeText={setVehicleNum}
          />
        )}

        <FloatingLabelInput label="Número de vehículo" iconName="directions-car" value={vehicleNum} onChangeText={setVehicleNum} />
        <CustomPicker label="Operador" selectedValue={operator} onValueChange={setOperator} options={operators} />
        <CustomPicker label="Prestador de servicio" selectedValue={intern} onValueChange={setIntern} options={interns} />
        <FloatingLabelInput label="Otros prestadores" iconName="groups" value={moreInterns} onChangeText={setMoreInterns} />
        <FloatingLabelInput label="Media filiación" iconName="face" value={affiliation} onChangeText={setAffiliation} />
        <CustomPicker label="Género" selectedValue={gender} onValueChange={setGender} options={genders} />
        <FloatingLabelInput label="Edad" iconName="person" value={age} onChangeText={setAge} />
        <FloatingLabelInput label="Domicilio" iconName="home" value={address} onChangeText={setAddress} />
        <FloatingLabelInput label="Colonia" iconName="location-city" value={colony} onChangeText={setColony} />
        <FloatingLabelInput label="Municipio" iconName="location-city" value={municipality} onChangeText={setMunicipality} />
        <FloatingLabelInput label="Teléfono" iconName="phone-android" value={phone} onChangeText={setPhone} />
        <FloatingLabelInput label="Derechohabiente a" iconName="person-add-alt" value={rightful} onChangeText={setRightful} />

        <TouchableOpacity style={s.saveButton} onPress={() => saveRecord('saved')}>
          <Text style={s.buttonText}>Guardar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.pendingButton} onPress={() => saveRecord('pending')}>
          <Text style={s.buttonText}>Terminar más tarde</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  container:     { padding:20, alignItems:'center', backgroundColor:'#f5f5f5' },
  title:         { fontSize:24, fontWeight:'bold', marginBottom:10 },
  image:         { width:100, height:100, marginBottom:20, borderRadius:8 },
  dateArea:      { width:'100%', marginVertical:10 },
  sectionTitle:  { fontSize:18, fontWeight:'bold', marginTop:20, marginBottom:10, alignSelf:'flex-start' },
  input:         { width:'100%', height:40, backgroundColor:'#fff', borderLeftWidth:4, borderLeftColor:'#20b2aa', paddingHorizontal:10, marginTop:10 },
  saveButton:    { backgroundColor:'#28a745', padding:12, borderRadius:8, marginTop:20, width:'100%' },
  pendingButton: { backgroundColor:'#6c757d', padding:12, borderRadius:8, marginTop:10, width:'100%' },
  buttonText:    { color:'#fff', textAlign:'center', fontWeight:'bold' },
});
