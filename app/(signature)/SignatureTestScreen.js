import React from 'react';
import { View, StyleSheet, Text, Pressable } from 'react-native';
import { Link } from 'expo-router';
import SignaturePad from '../components/SignaturePad';

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
    padding: 20,
  },
  backButton: {
    marginTop: 20,
    backgroundColor: '#20b2aa',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});