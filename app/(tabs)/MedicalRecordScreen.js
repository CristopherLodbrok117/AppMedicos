import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Modal,
  Pressable,
  Alert,
} from 'react-native';
import FloatingLabelInput from '../components/FloatingLabelInput';
import DateWheelPicker from '../components/DateWheelPicker';
import CustomPicker from '../components/CustomPicker';
import DatePicker from '../components/DatePicker';

import { initDatabase, insertRecord } from '../../services/database';

export default function MedicalRecordScreen() {
  const [date, setDate] = useState(new Date(Date.now()));
  const [showArea, setShowArea] = useState(false);
  const [weekDay, setWeekDay] = useState('');
  const [attentionReason, setAttentionReasons] = useState('');
  const [serviceLocation, setServiceLocation] = useState('');
  const [vehicleType, setVehicleType] = useState('');
  const [vehicleNum, setVehicleNum] = useState('');
  const [operator, setOperator] = useState('');
  const [intern, setIntern] = useState('');
  const [moreInterns, setMoreInterns] = useState('');
  const [affiliation, setAffiliation] = useState('');
  const [gender, setGender] = useState('');
  const [age, setAge] = useState('');
  const [address, setAddress] = useState('');
  const [colony, setColony] = useState('');
  const [municipality, setMunicipality] = useState('');
  const [phone, setPhone] = useState('');
  const [rightful, setRightful] = useState('');

  const weekDays = ['Lunes','Martes','Miércoles','Jueves','Viernes','Sábado','Domingo'];
  const attentionReasons = ['Enfermedad','Traumatismo','Gineco obstétrico'];
  const serviceLocations = ['Cucei','Inst. Dep.','Politécnico','Vocacional','Prepa 12','Via pública'];
  const vehicleTypes = ['Vehiculo oficial','Cuatrimoto','Ambulancia','Ambulancia eléctrica','Otro'];
  const operators = ['Javier Iñiguez','Rodrigo Guitierrez','Yair Villagrana','Jesús Hernandez','Jaime Juárez','Aida García'];
  const interns = operators;
  const genders = ['Masculino','Femenino'];

  useEffect(() => {
    initDatabase().catch(err => console.error(err));
  }, []);

  const saveRecord = async (statusLabel) => {
    const dateStr = date.toISOString().split('T')[0];
    const timeStr = date.toTimeString().split(' ')[0];

    const record = {
      date: dateStr,
      time: timeStr,
      weekDay,
      attentionReason,
      serviceLocation,
      vehicleType,
      vehicleNum,
      operator,
      intern,
      moreInterns,
      affiliation,
      gender,
      age,
      address,
      colony,
      municipality,
      phone,
      rightful,
    };

    try {
      const id = await insertRecord(record, statusLabel);
      Alert.alert(
        statusLabel === 'saved' ? 'Guardado' : 'Guardado como pendiente',
        `Expediente ID: ${id}`
      );
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'No se pudo guardar el expediente');
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.container} nestedScrollEnabled={true}>
        <Text style={styles.title}>Expediente Médico</Text>
        <Image style={styles.image} source={require('../assets/doctor.png')} />
        
        <View style={styles.dateArea}>
          <DatePicker
            date={date}
            setDate={setDate}
            title='Fecha de hoy'
            withTime={true}
          />
        </View>

        <Text style={styles.sectionTitle}>Ingrese los siguientes datos</Text>

        <CustomPicker label='Día de la semana' selectedValue={weekDay} onValueChange={setWeekDay} options={weekDays} />
        <CustomPicker label='Motivo de la atención' selectedValue={attentionReason} onValueChange={setAttentionReasons} options={attentionReasons} />
        <CustomPicker label='Ubicación del servicio' selectedValue={serviceLocation} onValueChange={setServiceLocation} options={serviceLocations} />
        <CustomPicker label='Vehículo' selectedValue={vehicleType} onValueChange={setVehicleType} options={vehicleTypes} />

        {vehicleType === 'Otro' && <TextInput style={styles.input} placeholder="Especificar otro" />}

        <FloatingLabelInput label="Número de vehículo" iconName="directions-car" value={vehicleNum} onChangeText={setVehicleNum} />
        <CustomPicker label='Operador' selectedValue={operator} onValueChange={setOperator} options={operators} />
        <CustomPicker label='Prestador de servicio' selectedValue={intern} onValueChange={setIntern} options={interns} />
        <FloatingLabelInput label="Otros prestadores" iconName="groups" value={moreInterns} onChangeText={setMoreInterns} />
        <FloatingLabelInput label="Nombre o media filiación" iconName="face" value={affiliation} onChangeText={setAffiliation} />
        <CustomPicker label='Género' selectedValue={gender} onValueChange={setGender} options={genders} />
        <FloatingLabelInput label="Edad" iconName="person" value={age} onChangeText={setAge} />
        <FloatingLabelInput label="Domicilio" iconName="home" value={address} onChangeText={setAddress} />
        <FloatingLabelInput label="Colonia" iconName="location-city" value={colony} onChangeText={setColony} />
        <FloatingLabelInput label="Municipio" iconName="location-city" value={municipality} onChangeText={setMunicipality} />
        <FloatingLabelInput label="Teléfono" iconName="phone-android" value={phone} onChangeText={setPhone} />
        <FloatingLabelInput label="Derechohabiente a" iconName="person-add-alt" value={rightful} onChangeText={setRightful} />

        <TouchableOpacity style={styles.saveButton} onPress={() => saveRecord('saved')}>
          <Text style={styles.buttonText}>Guardar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.pendingButton} onPress={() => saveRecord('pending')}>
          <Text style={styles.buttonText}>Terminar más tarde</Text>
        </TouchableOpacity>
      </ScrollView>

      <Modal visible={showArea} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Seleccionar fecha</Text>
            <DateWheelPicker title='Arrastrar para elegir fecha' />
            <Pressable onPress={() => setShowArea(false)} style={styles.closeButton}>
              <Text style={styles.buttonText}>Cerrar</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  image: {
    width: 100,
    height: 100,
    marginBottom: 20,
    borderRadius: 8,
    resizeMode: 'cover',
    alignSelf: 'center',
  },
  dateArea: {
    width: '100%',
    maxHeight: 300,
    marginVertical: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
  },
  saveButton: {
    backgroundColor: '#28a745',
    padding: 10,
    borderRadius: 8,
    marginTop: 20,
    width: '100%',
  },
  pendingButton: {
    backgroundColor: '#6c757d',
    padding: 10,
    borderRadius: 8,
    marginTop: 10,
    width: '100%',
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  input: {
    width: '100%',
    height: 40,
    backgroundColor: '#fff',
    borderLeftWidth: 4,
    borderLeftColor: '#20b2aa',
    borderRadius: 0,
    paddingHorizontal: 10,
    marginTop: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 15,
    width: '90%',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  closeButton: {
    marginTop: 20,
    backgroundColor: '#007bff',
    padding: 10,
    borderRadius: 8,
  },
});
