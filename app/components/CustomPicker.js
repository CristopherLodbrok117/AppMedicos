import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Picker } from '@react-native-picker/picker';

const CustomPicker = ({ label, selectedValue, onValueChange, options }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <Picker
        selectedValue={selectedValue}
        onValueChange={onValueChange}
        style={styles.picker}
      >
        {options.map((option, index) => (
          <Picker.Item key={index} label={option} value={index} />
        ))}
      </Picker>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%'
  },
  label: {
    
    fontSize: 16,
    fontWeight: '600',
    color: '#444',
    // color: '#03826f',
    marginTop: 20,
    marginBottom: 5,
    marginLeft: 3,
    alignSelf: 'flex-start',
  },
  picker: {
    width: '100%',
    height: 50,
    backgroundColor: '#f9f9f9',
    marginBottom: 5,
  },
});

export default CustomPicker;
