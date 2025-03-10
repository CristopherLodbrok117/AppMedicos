import React, { useState } from 'react';
import { View, Text, TextInput, Button, TouchableOpacity, StyleSheet, ScrollView, Image } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import FloatingLabelInput from './components/FloatingLabelInput';
import CustomPicker from './components/CustomPicker';
import SignaturePad from './components/SignaturePad';


export default function SignatureTestScreen() {


  return (
    <View style={styles.container}>
      <SignaturePad />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '90%',
    
    borderRadius: 10,
    borderColor: '#000',
    borderWidth: 2,
    backgroundColor: 'white',
  },
});
