import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  Button, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView, 
  Image,
  Modal,
  Pressable } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import FloatingLabelInput from '../components/FloatingLabelInput';
import CustomPicker from '../components/CustomPicker';
import IconImageV1 from '../components/IconImageV1';
import CheckListV1 from '../components/CheckListV1';
import globalStyles from '../styles/globalStyles';

const INJURIES = [
  "Deformidades (D)",
  "Contusiones (CD)",
  "Abrasiones (A)",
  "Penetraciones (P)",
  "Movimiento paradouico (MP)",
  "Creptación (C)",
  "Heridas (H)",
  "Fracturas (P)",
  "Efisema suticutaneo (ES)",
  "Quemaduras (Q)",
  "Laceraciones (L)",
  "Edema (E)",
  "Alteración de sensibilidad (AS)",
  "Alteración de movilidad (AM)",
  "Dolor (DO)",
];

export default function PhysicalExplorationScreen() {

  const [selectedInjuries, setSelectedInjuries] = useState([]);
  const [showInjuries, setShowInjuries] = useState(false);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      
      <Text style={styles.title}>Exploración Física</Text>
      
      <Text style={styles.subtitle}>Expediente médico</Text>

      <Image
        style={styles.image}
        source={require('../assets/doctor.png')}
      /> 
      
      <TouchableOpacity style={styles.expandButton} onPress={() => setShowInjuries(!showInjuries)}>
        <Text style={styles.buttonText}>{showInjuries ? 'Cerrar' : 'Elegir tipo de lesión'}</Text>
      </TouchableOpacity>

      {showInjuries && <View style={styles.expandableArea}>{
        
        }</View>}
        
      
      <Modal visible={showInjuries} animationType="slide" transparent>
        <View style={styles.modalOverlay} >
          <View style={styles.modalContent} >
            <Text style={styles.modalTitle}>Tipo de lesión</Text>
            <View style={styles.areaArea}>
              <CheckListV1
                items={INJURIES}
                selectedItems={selectedInjuries}
                setSelectedItems={setSelectedInjuries}
              />
            </View>

            <Pressable onPress={() => setShowInjuries(false)} style={styles.closeButton}>
              <Text style={styles.buttonText}>Cerrar</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      

      <View style={styles.imageArea}>
        <Text style={styles.subtitle}>Zona de lesión</Text>
        <IconImageV1 />
      </View>
      
      

      

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
    marginTop: 10,
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
    fontSize: 18,
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

  imageArea: {
    width: 500,
    height: 450,
    backgroundColor: '#fff',
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
    height: 450,
  },
  closeButton: {
    marginTop: 20,
    backgroundColor: '#007bff',
    padding: 10,
    borderRadius: 8,
  },
});
