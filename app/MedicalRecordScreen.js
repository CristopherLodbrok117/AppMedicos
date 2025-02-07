import React, { useState } from 'react';
import { View, Text, TextInput, Button, TouchableOpacity, StyleSheet, ScrollView, Image } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import FloatingLabelInput from './components/FloatingLabelInput';

export default function MedicalRecordScreen() {
  const [showArea, setShowArea] = useState(false);
  const [vehicleType, setVehicleType] = useState('');

  const [vehicleNum, setVehicleNum] = useState('');
  const [affiliation, setAffiliation] = useState('');
  const [age, setAge] = useState('');
  const [address, setAddress] = useState('');
  const [colony, setColony] = useState('');
  const [municipality, setMunicipality] = useState('');
  const [phone, setPhone] = useState('');
  const [rightful, setRightful] = useState('');
  

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Expediente Médico</Text>
      {/* Imagen central (el usuario define la fuente) */}
      <Image
              style={styles.image}
              source={require('./assets/doctor.png')}
      />
      <Text style={styles.dateLabel}>Fecha: 01/02/2025</Text>
      <Text style={styles.dateLabel}>Hora: 14:30</Text>
      
      <TouchableOpacity style={styles.expandButton} onPress={() => setShowArea(!showArea)}>
        <Text style={styles.buttonText}>{showArea ? 'Ocultar calendario' : 'Mostrar calendario'}</Text>
      </TouchableOpacity>
      {/*{showArea && <View style={styles.expandableArea}>{/* Aquí se coloca el componente }</View>}*/}
      {showArea && <View style={styles.expandableArea}></View>}
      
      <Text style={styles.sectionTitle}>Ingrese los siguientes datos</Text>
      
      {/* Selectores */}
      <Text style={styles.label}>Día de la semana</Text>
      <Picker style={styles.picker}>
        <Picker.Item label="Lunes" value="Lunes" />
        <Picker.Item label="Martes" value="Martes" />
        <Picker.Item label="Miércoles" value="Miércoles" />
        <Picker.Item label="Jueves" value="Jueves" />
        <Picker.Item label="Viernes" value="Viernes" />
      </Picker>
      
      <Text style={styles.label}>Motivo de la atención</Text>
      <Picker style={styles.picker}>
        <Picker.Item label="Enfermedad" value="Enfermedad" />
        <Picker.Item label="Accidente" value="Accidente" />
      </Picker>
      
      <Text style={styles.label}>Ubicación del servicio</Text>
      <Picker style={styles.picker}>
        <Picker.Item label="Cucei" value="Cucei" />
        <Picker.Item label="Calle" value="Calle" />
      </Picker>
      
      <Text style={styles.label}>Vehículo</Text>
      <Picker style={styles.picker} selectedValue={vehicleType} onValueChange={(value) => setVehicleType(value)}>
        <Picker.Item label="Carro" value="Carro" />
        <Picker.Item label="Camioneta" value="Camioneta" />
        <Picker.Item label="Otro" value="Otro" />
      </Picker>
      
      {vehicleType === 'Otro' && (
        <TextInput style={styles.input} placeholder="Especificar otro" />
      )}
      
      {/* <Text style={styles.label}>Número de vehículo</Text>
      <TextInput style={styles.input} placeholder="Número de vehículo" /> */}
      <FloatingLabelInput label="Número de vehículo" iconName="directions-car" value={vehicleNum} onChangeText={setVehicleNum} />
      
      <Text style={styles.label}>Operador</Text>
      <Picker style={styles.picker}>
        <Picker.Item label="Malcolm" value="Malcolm" />
        <Picker.Item label="Reese" value="Reese" />
        <Picker.Item label="Dewey" value="Dewey" />
      </Picker>
      
      <Text style={styles.label}>Prestador de servicio</Text>
      <Picker style={styles.picker}>
        <Picker.Item label="Hal" value="Hal" />
        <Picker.Item label="Louise" value="Louise" />
      </Picker>
      
      {/* <Text style={styles.label}>Nombre o media filiación</Text>
      <TextInput style={styles.input} placeholder="Nombre o media filiación" /> */}
      <FloatingLabelInput label="Nombre o media filiación" iconName="face" value={affiliation} onChangeText={setAffiliation} />
      
      <Text style={styles.label}>Género</Text>
      <Picker style={styles.picker}>
        <Picker.Item label="Masculino" value="Masculino" />
        <Picker.Item label="Femenino" value="Femenino" />
      </Picker>
      
      {/* <Text style={styles.label}>Edad</Text>
      <TextInput style={styles.input} placeholder="Ej. 18" keyboardType="numeric" /> */}
      <FloatingLabelInput label="Edad" iconName="person" value={age} onChangeText={setAge} />
      
      {/* <Text style={styles.label}>Domicilio</Text>
      <TextInput style={styles.input} placeholder="Ej. Blvd. Gral. Marcelino García Barragán #1421" /> */}
      <FloatingLabelInput label="Domicilio" iconName="home" value={address} onChangeText={setAddress} />
      
      {/* <Text style={styles.label}>Colonia</Text>
      <TextInput style={styles.input} placeholder="Ej. Olímpica" /> */}
      <FloatingLabelInput label="Colonia" iconName="location-city" value={colony} onChangeText={setColony} />

      {/* <Text style={styles.label}>Municipio</Text>
      <TextInput style={styles.input} placeholder="Ej. Guadalajara" /> */}
      <FloatingLabelInput label="Municipio" iconName="location-city" value={municipality} onChangeText={setMunicipality} />

      {/* <Text style={styles.label}>Telefono</Text>
      <TextInput style={styles.input} placeholder="Ej. 320541898" /> */}
      <FloatingLabelInput label="Teléfono" iconName="phone-android" value={phone} onChangeText={setPhone} />

      {/* <Text style={styles.label}>Derechohabiente a</Text>
      <TextInput style={styles.input} placeholder="Ej. nombre de conyugue, hijo, etc." /> */}
      <FloatingLabelInput label="Derechohabiente a" iconName="person-add-alt" value={rightful} onChangeText={setRightful} />
      
      <TouchableOpacity style={styles.saveButton}>
        <Text style={styles.buttonText}>Guardar</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: 'f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  imagePlaceholder: {
    width: 100,
    height: 100,
    backgroundColor: '#ccc',
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
  label: {
    fontSize: 16,
    color: '#03826f',
    marginTop: 20,
    marginBottom: 5,
    alignSelf: 'flex-start',
  },
  dateLabel: {
    fontSize: 16,
    color: '#03826f',
    marginTop: 5,
    marginBottom: 5,
    alignSelf: 'flex-start',
    fontWeight: 'bold',
  },
  picker: {
    width: '100%',
    height: 50,
    backgroundColor: '#f9f9f9',
    marginBottom: 10,
  },
  pickerItem:{
    fontFamily: 'serif',
    backgroundColor: 'blue',
  },
  input: {
    width: '100%',
    height: 40,
    backgroundColor: '#fff',
    borderLeftWidth: 4, // Borde izquierdo
    borderLeftColor: '#20b2aa', // Color verde azulado
    borderTopWidth: 0, // Sin borde superior
    borderRightWidth: 0, // Sin borde derecho
    borderBottomWidth: 0, // Sin borde inferior
    borderRadius: 0, // Sin esquinas redondeadas
    paddingHorizontal: 10,
    marginTop: 10,
  },
  expandButton: {
    backgroundColor: '#007bff',
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  expandableArea: {
    width: '100%',
    height: 500,
    backgroundColor: '#e6e6e6',
    marginBottom: 10,
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
});
