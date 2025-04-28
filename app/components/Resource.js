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

import HorizontalScrollPicker from '../components/HorizontalScrollPicker';
import CustomButton from './CustomButton';

export default function Resource({name}) {
  const [showArea, setShowArea] = useState(false);

  
  const [selectedValue, setSelectedValue] = useState(0);

  return (
    <View contentContainerStyle={styles.container}>

      <CustomButton
        title={name}
        onPress={() => setShowArea(true)}
        fontSize={18}
        padding={9}
        icon="medication" // Icon name from MaterialIcons
        iconColor="white"
        iconSize={24}
      />

      <Modal visible={showArea} animationType="slide" transparent>
        <View style={styles.modalOverlay} >
          <View style={styles.modalContent} >
            
            <Text style={styles.modalTitle}>{name}</Text>
            
            <View style={styles.areaArea}>
            <HorizontalScrollPicker
              numbers={Array.from({ length: 20 + 1 }, (_, i) => i)}
              value={selectedValue}
              onValueChange={setSelectedValue}
              itemWidth={80}
              selectedColor="#20b2aa"
            />
            </View>
            
            <CustomButton
              title='Cerrar'
              onPress={() => setShowArea(false)}
              fontSize={18}
              padding={9}
              icon="medication" // Icon name from MaterialIcons
              iconColor="white"
              iconSize={24}
            />
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
