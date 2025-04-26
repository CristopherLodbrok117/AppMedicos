import React, { useState } from 'react';
import { View, Text, TextInput, Button, TouchableOpacity, StyleSheet, ScrollView, Image } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import DateWheelPicker from '../components/DateWheelPicker';
import FloatingLabelInput from '../components/FloatingLabelInput';
import CustomPicker from '../components/CustomPicker';
import DatePicker from '../components/DatePicker';

// import doctorImage from './assets/doctor.png';

const PatientEvaluationScreen = () => {
  // const [showArea, setShowArea] = useState(false);

  const [otherCause, setOtherCause] = useState('');
  const [injuryCause, setInjuryCause] = useState('');
  const [secondCause, setSecondCause] = useState('');
  const [specificCause, setSpecificCause] = useState('');
  const [minute1, setMinute1] = useState('');
  const [minute5, setMinute5] = useState('');
  const [minute10, setMinute10] = useState('');
  const [gesta, setGesta] = useState('');
  const [para, setPara] = useState('');
  const [ceasrean, setCesarean] = useState('');
  const [abortion, setAbortion] = useState('');
  
  

  const [showApgar, setShowApgar] = useState(false);
  
  /* CustomPicker variables  */
  const [traumaCause, setTraumaCause] = useState('');
  const [clinicCause, setClinicCause] = useState('');
  const [product, setProduct] = useState('');
  const [gender, setGender] = useState('');

  const traumaCauses = ['Otro', 'Arma', 'Automotor', 'Maquinaria', 'Bicicleta', 'Herramienta', 'Electricidad'
    , 'Fuego', 'Sustancia caliente', 'Producto biológico', 'Sustancia tóxica', 'Juguete', 'Explosión'
    , 'Ser humano', 'Animal'];
  const clinicCauses = ['Otro', 'Neurología', 'Cardiovascular', 'Respiratorio', 'Metabólico', 'Digestiva'
    , 'Urogenital', 'Gineco obstétrica', 'Psico emotiva', 'Músculo esquelético', 'infecciosa', 'Oncológico'];
  const products = ['No aplica', 'Vivo', 'Muerto'];
  const genders = ['No aplica', 'Masculino', 'Femenino'];

  const [lastCycleDate, setLastCycleDate] = useState(new Date(Date.now()));
  const [birthDate, setBirthDate] = useState(new Date(Date.now()));

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Expediente Médico</Text>
      {/* Imagen central (el usuario define la fuente) */}
      {/* <View style={styles.imagePlaceholder} /> */}
      <Image
        style={styles.image}
        source={require('../assets/doctor.png')}
      />

      <CustomPicker 
        label = 'Causa traumática (agente casual)'
        selectedValue={traumaCause}
        onValueChange={setTraumaCause}
        options={traumaCauses}
      />


      {/* <Text style={styles.label}>En caso de otra causa traumática, indicar cual</Text>
      <TextInput style={styles.input} placeholder="Otro" /> */}
      <FloatingLabelInput label="En caso de otra causa traumática, indicar cual" iconName="personal-injury" value={otherCause} onChangeText={setOtherCause} />

      <FloatingLabelInput label="Mecanismo de lesión" iconName="healing" value={injuryCause} onChangeText={setInjuryCause} />
  
      <CustomPicker 
        label = 'Causa clínica (órigen probable)'
        selectedValue={clinicCause}
        onValueChange={setClinicCause}
        options={clinicCauses}
      />

      <FloatingLabelInput label="En caso de otra causa clínica, indicar cual" iconName="domain" value={secondCause} onChangeText={setSecondCause} />
  

      <FloatingLabelInput label="Causa específica" iconName="medical-services" value={specificCause} onChangeText={setSpecificCause} />
  


      {/* -------------------------------Sección parto-------------------------------- */}
      <Text style={styles.sectionTitle}>Información de parto</Text>

      <CustomPicker 
        label = 'Producto'
        selectedValue={product}
        onValueChange={setProduct}
        options={products}
      />

      <CustomPicker 
        label = 'Sexo'
        selectedValue={gender}
        onValueChange={setGender}
        options={genders}
      />


      {/* -------------------------------APGAR-------------------------------- */}
      <TouchableOpacity style={styles.expandButton} onPress={() => setShowApgar(!showApgar)}>
        <Text style={styles.buttonText}>{showApgar ? 'Ocultar Apgar' : 'Mostrar Apgar'}</Text>
      </TouchableOpacity>
      {/*{showArea && <View style={styles.expandableArea}>{/* Aquí se coloca el componente }</View>}*/}
      {showApgar && <View style={styles.expandableArea}></View>}


      {/* --------------------------------------------------------------- */}
      <Text style={styles.sectionTitle}>Observaciones</Text>

      <FloatingLabelInput label="Minuto 1" iconName="access-time" value={minute1} onChangeText={setMinute1} />

      <FloatingLabelInput label="Minuto 5" iconName="access-time" value={minute5} onChangeText={setMinute5} />
 
      <FloatingLabelInput label="Minuto 10" iconName="access-time" value={minute10} onChangeText={setMinute10} />
 
      <FloatingLabelInput label="Gesta" iconName="view-list" value={gesta} onChangeText={setGesta} />

      <FloatingLabelInput label="Para" iconName="pregnant-woman" value={para} onChangeText={setPara} />
 
      <FloatingLabelInput label="Cesárea" iconName="pregnant-woman" value={ceasrean} onChangeText={setCesarean} />
      
      <FloatingLabelInput label="Aborto" iconName="cancel" value={abortion} onChangeText={setAbortion} />

      {/* -------------------------------FECHAS ------------------------------- */}

      

      <View style={styles.dateArea}>
        <DatePicker
          date={lastCycleDate}
          setDate={setLastCycleDate}
          title='Última fecha de menstruación'
          withTime={false} // Cambiar a true para permitir modificar y mostrar hora (false para ocultarlos)
        />
      </View>

      <View style={styles.dateArea}>
        <DatePicker
          date={birthDate}
          setDate={setBirthDate}
          title='Fecha probable de parto'
          withTime={false} // Cambiar a true para permitir modificar y mostrar hora (false para ocultarlos)
        />
      </View>

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
    // width: '97%',
    // height: 200,
    marginBottom: 5,
    marginTop: 25,
    borderRadius: 15,
    backgroundColor: '#fff',
  },
  dateArea: {
    width: '100%',
    maxHeight: 300,
    marginVertical: 10,
  },
  saveButton: {
    backgroundColor: '#28a745',
    padding: 10,
    borderRadius: 8,
    marginTop: 20,
    width: '100%',
  },
});
