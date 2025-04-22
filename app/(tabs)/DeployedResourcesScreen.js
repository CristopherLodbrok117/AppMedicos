import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView, 
  Image,
  Modal,
  Pressable, } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import FloatingLabelInput from '../components/FloatingLabelInput';
import CustomPicker from '../components/CustomPicker';
import DateWheelPicker from '../components/DateWheelPicker';
import SideLabelWheelPicker from '../components/SideLabelWheelPicker';

// import CustomWheelPicker from './components/CustomWheelPicker';
import MyWheelPicker from '../components/MyWheelPicker';
import TopLabelWheelPicker from '../components/TopLabelWheelPicker';
import HorizontalScrollPicker from '../components/HorizontalScrollPicker';

export default function DeployedResourcesScreen() {
  const [showArea, setShowArea] = useState(false);
  const [vehicleType, setVehicleType] = useState('');

  const [vehicleNum, setVehicleNum] = useState('');

  const [evaluationItem, setEvaluationItem] = useState('');
  
  const firstEvaluationItems = ['No aplica', 'Consciente', 'Respuesta a estimulo verbal', 'Respuesta a estimulo doloroso', 'Inconsciente'];

  const resources = ['Agua inyectable 500ml', 'Agua oxigenada', 'Agujas 20x32', 'Algodón paquete'
    , 'Bata desechable', 'Bolsa negra', 'Bolsa roja', 'Bolsa amarilla', 'Bum free gel', 'Campos estériles'
    , 'Cánula blanda de aspiración', 'Cánulas nasofaringeas', 'Cánulas orofaringeas', 'Cánula Yankawer'
    , 'Catéter #12', 'Catéter #14', 'Catéter #16', 'Catéter #18', 'Catéter #20', 'Catéter #22', 'Catéter #24'
    , 'Cinta Transporte 3m 1', 'Cinta Transporte 3m 2', 'Collarines desechables', 'Cubrebocas'
    , 'Desinfectante para manos' , 'Desinfectante para superficies', 'Fijador de TE adulto'
    , 'Fijador de TE pediátrico', 'Gasas estériles', 'Gasas no estériles'];

  const resourcesAmount = Array.from({ length: 101 }, (_, index) => index);
  
  const [selectedValue, setSelectedValue] = useState(0);

  

  return (
    <ScrollView contentContainerStyle={styles.container}

      keyboardShouldPersistTaps="handled"
      horizontal={false}
      nestedScrollEnabled={true}>

      <Text style={styles.title}>Recursos Utilizados</Text>
      
      

      <Image
        style={styles.image}
        source={require('../assets/doctor.png')}
      />
      
      <Text style={styles.subtitle}>Arrastre para seleccionar la cantidad de insumos</Text>

      <TouchableOpacity style={styles.expandButton} onPress={() => setShowArea(true)}>
        <Text style={styles.buttonText}>Cambiar fecha</Text>
      </TouchableOpacity>

      {/* <View style={styles.areaArea}>
        <Text style={styles.label}>Cantidad de {resources[0]}</Text>
        <HorizontalScrollPicker
          numbers={resourcesAmount}
          value={selectedValue}
          onValueChange={setSelectedValue}
          itemWidth={80}
          selectedColor="#20b2aa"
        />
      </View>
      <View style={styles.areaArea}>
        <Text style={styles.label}>Cantidad de {resources[0]}</Text>
        <HorizontalScrollPicker
          numbers={resourcesAmount}
          value={selectedValue}
          onValueChange={setSelectedValue}
          itemWidth={80}
          selectedColor="#20b2aa"
        />
      </View>
      <View style={styles.areaArea}>
        <Text style={styles.label}>Cantidad de {resources[0]}</Text>
        <HorizontalScrollPicker
          numbers={resourcesAmount}
          value={selectedValue}
          onValueChange={setSelectedValue}
          itemWidth={80}
          selectedColor="#20b2aa"
        />
      </View> */}
      <Modal visible={showArea} animationType="slide" transparent>
        <View style={styles.modalOverlay} >
          <View style={styles.modalContent} >
            <Text style={styles.modalTitle}>Insumo</Text>
            <View style={styles.areaArea}>
            <HorizontalScrollPicker
              numbers={Array.from({ length: 20 + 1 }, (_, i) => i)}
              value={selectedValue}
              onValueChange={setSelectedValue}
              itemWidth={80}
              selectedColor="#20b2aa"
            />
            </View>
            
            <Pressable onPress={() => setShowArea(false)} style={styles.closeButton}>
              <Text style={styles.buttonText}>Cerrar</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      

      {/* <SideLabelWheelPicker 
        label='Tapabocas'
        items={resourcesAmount}
      />


      {resources.map((resource, index) => (
        <SideLabelWheelPicker key={index}
          label={resource}
        items={resourcesAmount}
        />
      ))} */}




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
    marginTop: 30,
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
    color: '#000',
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
    borderRadius: 15,
    marginTop: 20,
    width: '30%',
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
  areaArea: {
    width: "100%",
    height: 150,
  },
  closeButton: {
    marginTop: 20,
    backgroundColor: '#007bff',
    padding: 10,
    borderRadius: 8,
  },
});
