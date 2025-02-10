import React, { useState } from 'react';
import { View, Text, TextInput, Button, TouchableOpacity, StyleSheet, ScrollView, Image } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import FloatingLabelInput from './components/FloatingLabelInput';
import CustomPicker from './components/CustomPicker';

export default function MedicalRecordScreen() {
  const [showArea, setShowArea] = useState(false);
  const [vehicleType, setVehicleType] = useState('');

  const [vehicleNum, setVehicleNum] = useState('');

  const [evaluationItem, setEvaluationItem] = useState('');
  const [ventilationItem, setVentilationItem] = useState('');
  const [circulationItem, setCirculationItem] = useState('');
  const [airRouteItem, setAirRouteItem] = useState('');
  const [respiratorySoundsItem, setRespiratorySoundsItem] = useState('');
  const [lungSideItem, setLungSideItem] = useState('');
  const [lungPartItem, setLungPartItem] = useState('');
  const [qualityItem, setQualityItem] = useState('');
  const [swallowingReflexItem, setSwallowingReflexItem] = useState('');
  const [skinItem, setSkinItem] = useState('');
  const [characteristicsItem, setCharacteristicsItem] = useState('');
  
  const firstEvaluationItems = ['No aplica', 'Consciente', 'Respuesta a estimulo verbal', 'Respuesta a estimulo doloroso', 'Inconsciente'];
  const ventilationItems = ['No aplica', 'Automatismo regular', 'Automatismo irregular', 'Ventilación rápida', 'Ventilación superficial', 'Apnea'];
  const circulationItems = ['No aplica', 'Carotideo', 'Radial', 'Paro cardiorespiratorio'];
  const airRouteItems = ['No aplica', 'Permeable', 'Comprometida'];
  const respiratorySoundsItems = ['No aplica', 'Ruidos respiratorios normales', 'Ruidos respiratorios disminuidos', 'Ruidos respiratorios ausentes'];
  const lungSideItems = ['No aplica', 'Derecho', 'Izquierdo', 'Ambos'];
  const lungPartItems = ['No aplica', 'Apical', 'Base', 'Ambos'];
  const qualityItems = ['No aplica', 'Rápido', 'Lento', 'Rítmico', 'Arítmico'];
  const swallowingReflexItems = ['No aplica', 'Ausente', 'Presente'];
  const skinItems = ['No aplica', 'Pálida', 'Cianótica'];
  const characteristicsItems = ['No aplica', 'Eutérmica', 'Caliente', 'Fria', 'Diaforesis'];

  return (
    <ScrollView contentContainerStyle={styles.container}>
      
      <Text style={styles.title}>Evaluación Inicial</Text>
      
      <Text style={styles.subtitle}>Expediente médico</Text>

      <Image
        style={styles.image}
        source={require('./assets/doctor.png')}
      />
      
      {/* Evaluación inicial */}
      <CustomPicker 
        label="Evaluación Inicial"
        selectedValue={evaluationItem}
        onValueChange={setEvaluationItem}
        options={firstEvaluationItems}
      />

      
      {/* Ventilación */}
      <CustomPicker 
        label="Ventilación"
        selectedValue={ventilationItem}
        onValueChange={setVentilationItem}
        options={ventilationItems}
      />

      {/* Circulación */}
      <CustomPicker 
        label="Circulación"
        selectedValue={circulationItem}
        onValueChange={setCirculationItem}
        options={circulationItems}
      />

      {/* Via aerea */}
      <CustomPicker 
        label="Via aerea"
        selectedValue={airRouteItem}
        onValueChange={setAirRouteItem}
        options={airRouteItems}
      />

      {/* Ruidos Respiratorios */}
      <CustomPicker 
        label="Ruidos Respiratorios"
        selectedValue={respiratorySoundsItem}
        onValueChange={setRespiratorySoundsItem}
        options={respiratorySoundsItems}
      />
      
      {/* Lado del pulmon */}
      <CustomPicker 
        label="Lado del pulmon"
        selectedValue={lungSideItem}
        onValueChange={setLungSideItem}
        options={lungSideItems}
      />
      
      {/* Parte del pulmon */}
      <CustomPicker 
        label="Parte del pulmon"
        selectedValue={lungPartItem}
        onValueChange={setLungPartItem}
        options={lungPartItems}
      />

      {/* Calidad */}
      <CustomPicker 
        label="Calidad"
        selectedValue={qualityItem}
        onValueChange={setQualityItem}
        options={qualityItems}
      />

      {/* Reflejo de deglucion */}
      <CustomPicker 
        label="Reflejo de deglucion"
        selectedValue={swallowingReflexItem}
        onValueChange={setSwallowingReflexItem}
        options={swallowingReflexItems}
      />

      {/* Piel */}
      <CustomPicker 
        label="Piel"
        selectedValue={skinItem}
        onValueChange={setSkinItem}
        options={skinItems}
      />

      {/* Características */}
      <CustomPicker 
        label="Características"
        selectedValue={characteristicsItem}
        onValueChange={setCharacteristicsItem}
        options={characteristicsItems}
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
