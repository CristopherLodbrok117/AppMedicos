import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, View, Image, ScrollView, Pressable } from 'react-native';
import { Link } from "expo-router";

import FloatingLabelInput from '../components/FloatingLabelInput';
import CustomPicker from '../components/CustomPicker';
import RedirectButton from '../components/RedirectButton';


const PatientTransferScreen = () => {

  /* Variables */ 
  const [institution, setInstitution] = useState('');
  const [patientName, setPatientName] = useState('');
  const [witnessName, setWitnessName] = useState('');
  const [observations, setObservations] = useState('');
  const [dependencies, setDependencies] = useState('');
  const [units, setUnits] = useState('');
  const [officerName, setOfficerName] = useState('');
  const [belongings, setBelongings] = useState('');
  const [receiver, setReceiver] = useState('');

  const [paramedicName, setParamedicName] = useState('');
  const [doctorName, setDoctorName] = useState('');

  /* CustomPicker items */
  const paramedicNames = ['TSUP Rodrigo de Jesus Guitierrez Vega', 'Dalto', 'Bryan'];
  const doctorNames = ['Dr. House', 'Dr. Who', 'Dr. Strange'];
  

  return (
    <View style={styles.container}>
      {/* Barra de navegación izquierda */}
      {/* <SideNavigationBar /> */}

      {/* Contenido principal */}
      <ScrollView contentContainerStyle={styles.mainContent}>
        {/* Título */}
        <Text style={styles.title}>Traslado de paciente</Text>

        {/* Subtítulo */}
        <Text style={styles.subtitle}>Expediente médico</Text>

        {/* Imagen */}
        <Image
          style={styles.image}
          source={require('../assets/doctor.png')}
        />

<FloatingLabelInput label='Institución a la que se traslada el paciente' iconName='location-pin' value={institution} onChangeText={setInstitution}/>

        {/* Disclaimer */}
        <View style={styles.loremContainer}>
          <Text style={styles.loremText}>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer nec odio. Praesent libero. Sed cursus ante dapibus diam.
          </Text>
        </View>

        {/* Información del paciente */}
        <Text style={styles.sectionSubtitle}>Información del paciente</Text>

        {/* Firma paciente */}
        
        <View style={styles.signature}>
          <View style={styles.signatureInput}>
          <FloatingLabelInput label='Nombre del paciente' iconName='person' value={patientName} onChangeText={setPatientName}/>
          </View>

          <View style={styles.signatureButton}>
            <RedirectButton
              refName='(signature)/SignatureTestScreen'
              iconName='edit-square'
            />
          </View>
        </View>

        <FloatingLabelInput label='Nombre del testigo' iconName='person-outline' value={witnessName} onChangeText={setWitnessName}/>

        <FloatingLabelInput label='Observaciones' iconName='mode-edit' value={observations} onChangeText={setObservations}/>

        {/* Sección de dependencias */}
        <Text style={styles.sectionSubtitle}>Dependencias que atendieron al paciente</Text>

        <FloatingLabelInput label='Dependencias' iconName='apartment' value={dependencies} onChangeText={setDependencies} />

        <FloatingLabelInput label='Número de unidades' iconName='fire-truck' value={units} onChangeText={setUnits}/>

        <FloatingLabelInput label='Nombre del encargado y/o oficiales' iconName='person-4' value={officerName} onChangeText={setOfficerName}/>

        <FloatingLabelInput label='Pertenencias' iconName='backpack' value={belongings} onChangeText={setBelongings}/>

        <FloatingLabelInput label='Nombre de quien recibe las pertenencias' iconName='mode-edit' value={receiver} onChangeText={setReceiver}/>

        {/* Entrega */}
        {/* <Text style={styles.sectionSubtitle}>Entrega a paciente</Text>
        <TextInput style={styles.input} placeholder="Paramédico" /> */}
        
        {/* Firma paramédico*/}
        <View style={styles.signature}>
          <View style={styles.signatureInput}>
            <CustomPicker
              label='Entrega a paciente'
              selectedValue={paramedicName}
              onValueChange={setParamedicName}
              options={paramedicNames}
            />
          </View>

          <View style={styles.signatureButton}>
            <RedirectButton
              refName='(signature)/SignatureTestScreen'
              iconName='edit-square'
            />
          </View>
        </View>

        {/* Medico firma*/}
        <View style={styles.signature}>

          <View style={styles.signatureInput}>
            <FloatingLabelInput
              label='Médico que recibe'
              iconName='person'
              value={doctorName}
              onChangeText={setDoctorName}
            />
          </View>

          <View style={styles.signatureButton}>
            <RedirectButton
              refName='(signature)/SignatureTestScreen'
              iconName='edit-square'
            />
          </View>

        </View>
        
        {/* <CustomPicker 
          label='Médico que recibe'
          selectedValue={doctorName}
          onValueChange={setDoctorName}
          options={doctorNames}
        /> */}

        {/* Finalizar */}
        <Pressable style={styles.saveButton}>
          <Text style={styles.saveButtonText}>Guardar</Text> 
        </Pressable>

      </ScrollView>
    </View>
  );
};

export default PatientTransferScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row', // Alinea barra lateral y contenido principal en fila
    backgroundColor: '#f5f5f5',
  },
  mainContent: {
    flexGrow: 1,
    padding: 20,
  },
  title: {
    marginTop: 20,
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    alignSelf: 'center',
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#555',
    marginBottom: 20,
    alignSelf: 'center',
  },
  image: {
    width: 100,
    height: 100,
    marginBottom: 20,
    borderRadius: 8,
    resizeMode: 'cover',
    alignSelf: 'center',
  },
  loremContainer: {
    width: '100%',
    height: 150,
    backgroundColor: '#ddda',
    borderRadius: 8,
    justifyContent: 'center',
    padding: 10,
    marginTop: 20,
  },
  loremText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'justify',
  },
  sectionSubtitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#444',
    marginTop: 35,
    alignSelf: 'flex-start',
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
  saveButton: {
    // backgroundColor: '12a4d9',
    // width: 100,
    // height: 60,
    // borderRadius: 8,
    marginTop: 20,
    alignSelf: 'center',
    backgroundColor: '#28a745', // Verde azulado
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 20,

  },
  saveButtonText:{
    fontSize: 18,
    color: '#fff',
    fontWeight: '600',
    textAlign: 'center',
  },
  signature: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  signatureInput: {
     width: '75%',
    //  backgroundColor: 'grey',
  },
  signatureButton: {
    width: '20%',
    
    // backgroundColor: 'grey',
  }
});