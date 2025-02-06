import React, { useState } from 'react';
import { View, Text, TextInput, Button, TouchableOpacity, StyleSheet, ScrollView, Image } from 'react-native';
import { Picker } from '@react-native-picker/picker';

// import doctorImage from './assets/doctor.png';

const PatientEvaluationScreen = () => {
  // const [showArea, setShowArea] = useState(false);
  const [showApgar, setShowApgar] = useState(false);
  const [vehicleType, setVehicleType] = useState('');

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Expediente Médico</Text>
      {/* Imagen central (el usuario define la fuente) */}
      {/* <View style={styles.imagePlaceholder} /> */}
      <Image
        style={styles.image}
        source={require('./assets/doctor.png')}
      />



      <Text style={styles.label}>Causa traumática (agente casual)</Text>
      <Picker style={styles.picker}>
        <Picker.Item label="Arma" value="Arma" />
        <Picker.Item label="Otro" value="Otro" />
      </Picker>

      <Text style={styles.label}>En caso de otra causa traumática, indicar cual</Text>
      <TextInput style={styles.input} placeholder="Otro" />

      <Text style={styles.label}>Mecanismo de lesión</Text>
      <TextInput style={styles.input} placeholder="Describir..." />
      
      
      <Text style={styles.label}>Causa clínica (órigen probable)</Text>
      <Picker style={styles.picker}>
        <Picker.Item label="Otro" value="Otro" />
        <Picker.Item label="Accidente" value="Accidente" />
      </Picker>

      <Text style={styles.label}>En caso de otra causa clínica, indicar cual</Text>
      <TextInput style={styles.input} placeholder="Escribir..." />

      <Text style={styles.label}>Causa específica</Text>
      <TextInput style={styles.input} placeholder="Escribir..." />


      {/* -------------------------------Sección parto-------------------------------- */}
      <Text style={styles.sectionTitle}>Información de parto</Text>

      <Text style={styles.label}>Producto</Text>
      <Picker style={styles.picker}>
        <Picker.Item label="No aplica" value="No aplica" />
        <Picker.Item label="Vivo" value="Vivo" />
        <Picker.Item label="Muerto" value="Muerto" />
      </Picker>

      <Text style={styles.label}>Sexo</Text>
      <Picker style={styles.picker}>
        <Picker.Item label="No aplica" value="No aplica" />
        <Picker.Item label="Masculino" value="Masculino" />
        <Picker.Item label="Femenino" value="Femenino" />
      </Picker>


      {/* -------------------------------APGAR-------------------------------- */}
      <TouchableOpacity style={styles.expandButton} onPress={() => setShowApgar(!showApgar)}>
        <Text style={styles.buttonText}>{showApgar ? 'Ocultar Apgar' : 'Mostrar Apgar'}</Text>
      </TouchableOpacity>
      {/*{showArea && <View style={styles.expandableArea}>{/* Aquí se coloca el componente }</View>}*/}
      {showApgar && <View style={styles.expandableArea}></View>}


      {/* --------------------------------------------------------------- */}
      <Text style={styles.sectionTitle}>Observaciones</Text>

      <Text style={styles.label}>Minuto 1</Text>
      <TextInput style={styles.input} placeholder="Observaciones..." />

      <Text style={styles.label}>Minuto 5</Text>
      <TextInput style={styles.input} placeholder="Observaciones..." />

      <Text style={styles.label}>Minuto 10</Text>
      <TextInput style={styles.input} placeholder="Observaciones..." />

      <Text style={styles.label}>Gesta</Text>
      <TextInput style={styles.input} placeholder="Gesta" />

      <Text style={styles.label}>Para</Text>
      <TextInput style={styles.input} placeholder="Para" />

      <Text style={styles.label}>Cesarea</Text>
      <TextInput style={styles.input} placeholder="Cesarea" />

      <Text style={styles.label}>Aborto</Text>
      <TextInput style={styles.input} placeholder="Aborto" />

      {/* -------------------------------FECHAS ------------------------------- */}

      
      <Text style={styles.label}>Última fecha de menstruación</Text>
      <View style={styles.datePickerArea}></View>

      <Text style={styles.label}>Fecha probable de parto</Text>
      <View style={styles.datePickerArea}></View>

      <TouchableOpacity style={styles.saveButton}>
        <Text style={styles.buttonText}>Guardar</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

export default  PatientEvaluationScreen;

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
    color: '#666',
    marginTop: 20,
    marginBottom: 5,
    alignSelf: 'flex-start',
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
    marginTop: 20,
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
  datePickerArea: {
    width: '97%',
    height: 200,
    marginBottom: 15,
    marginTop: 10,
    borderRadius: 15,
    backgroundColor: '#fff',
  },
  saveButton: {
    backgroundColor: '#28a745',
    padding: 10,
    borderRadius: 8,
    marginTop: 20,
    width: '100%',
  },
});
