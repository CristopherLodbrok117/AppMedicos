import React, { useState } from 'react';
import { View, Text, TextInput, Button, TouchableOpacity, StyleSheet, ScrollView, Image } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import FloatingLabelInput from '../components/FloatingLabelInput';
import CustomPicker from '../components/CustomPicker';

export default function PatientConditionScreen() {
  const [showArea, setShowArea] = useState(false);
  const [vehicleType, setVehicleType] = useState('');

  /* CustomPicker variables */
  const [stability, setStability] = useState('');
  const [patientColor, setPatientColor] = useState('');
  const [airway, setAirway] = useState('');
  const [descompression, setDescompression] = useState('');
  const [side, setSide] = useState('');
  const [cervical, setCervical] = useState('');
  const [ventilatoryHelp, setVentilatoryHelp] = useState('');
  const [oxigenTherapy, setOxigenTherapy] = useState('');
  const [hemorrhageControl, setHemorrhageControl] = useState('');
  const [solutionType, setSolutionType] = useState('');
  const [rcp, setRcp] = useState('');

  const stabilityItems = ['Si', 'No'];
  const patientColors = ['No aplica', 'Rojo', 'Amarillo', 'Verde', 'Negra'];
  const airways = ['No aplica', 'Aspiración', 'Canula orofaríngenea', 'Canula nasofaríngenea'
    , 'Intubación endotraqueal', 'Mascarilla laringenea', 'Combitubo', 'Cricotirodotomía por punción'];
  const descompressions = ['No', 'Si'];
  const sides = ['Derecho', 'Izquierdo'];
  const cervicals = ['No aplica', 'Manual', 'Collarín', 'Collarín blando'];
  const ventilatoryHelpItems = ['No aplica', 'BVM', 'Ventilador automático'];
  const oxigenTherapyItems = ['No aplica', 'Puntas nasales', 'Mascarilla simple', 'Mascarilla de reservorio', 'Mascarilla venturi'];
  const hemorrhageControlItems = ['No aplica', 'Presión directa', 'Presión indirecta', 'Gravedad', 'Vendaje compresivo', 'Crioterapia', 'Hemostático'];
  const solutionsTypes = ['No aplica', 'Hartman', 'NACL 0.9%', 'Mixta', 'Clucosa 5%'];
  const rcps = ['No aplica', 'RCP básica', 'RCP avanzada'];

  
  

  return (
    <ScrollView contentContainerStyle={styles.container}>
      
      <Text style={styles.title}>Condición del Paciente</Text>
      
      <Text style={styles.subtitle}>Expediente médico</Text>

      <Image
        style={styles.image}
        source={require('../assets/doctor.png')}
      />
      
      <CustomPicker
        label='Se encuentra estable'
        selectedValue={stability}
        onValueChange={setStability}
        options={stabilityItems}
      />

      <CustomPicker
        label='Color del paciente'
        selectedValue={patientColor}
        onValueChange={setPatientColor}
        options={patientColors}
      />

      <CustomPicker
        label='Via aérea'
        selectedValue={airway}
        onValueChange={setAirway}
        options={airways}
      />

      <CustomPicker
        label='Descompresión pleural'
        selectedValue={descompression}
        onValueChange={setDescompression}
        options={descompressions}
      />

      <CustomPicker
        label='Lado'
        selectedValue={side}
        onValueChange={setSide}
        options={sides}
      />

      <CustomPicker
        label='Control cervical'
        selectedValue={cervical}
        onValueChange={setCervical}
        options={cervicals}
      />

      <CustomPicker
        label='Asistencia ventilatoria'
        selectedValue={ventilatoryHelp}
        onValueChange={setVentilatoryHelp}
        options={ventilatoryHelpItems}
      />

      <CustomPicker
        label='Oxigenoterapía'
        selectedValue={oxigenTherapy}
        onValueChange={setOxigenTherapy}
        options={oxigenTherapyItems}
      />

      <CustomPicker
        label='Control de hemorragías'
        selectedValue={hemorrhageControl}
        onValueChange={setHemorrhageControl}
        options={hemorrhageControlItems}
      />

      <CustomPicker
        label='Tipo de soluciones'
        selectedValue={solutionType}
        onValueChange={setSolutionType}
        options={solutionsTypes}
      />

      <CustomPicker
        label='RCP'
        selectedValue={rcp}
        onValueChange={setRcp}
        options={rcps}
      />


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
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#555',
    marginBottom: 20,
    alignSelf: 'center',
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
