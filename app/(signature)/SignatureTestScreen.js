import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useNavigation } from '@react-navigation/native';
import SignaturePad from '../components/SignaturePad';
import { initDatabase, getPatientTransferById, updatePatientTransfer } from '../../services/database';

const fieldFor = (t) => (
  t === 'paramedic' ? 'paramedicSignatureSvg'
  : t === 'doctor' ? 'doctorSignatureSvg'
  : 'patientSignatureSvg'
);

export default function SignatureTestScreen() {
  const { recordId: rawId, target = 'patient' } = useLocalSearchParams();
  const recordId = rawId ? parseInt(rawId, 10) : null;
  const navigation = useNavigation();

  const padRef = useRef(null);
  const [initialSvg, setInitialSvg] = useState(null);

  // Quita títulos duplicados; deja sólo "Firma digital"
  useEffect(() => {
    navigation.setOptions({ title: 'Firma digital', headerBackTitleVisible: false });
  }, [navigation]);

  // Carga firma previa (SVG) desde BD
  useEffect(() => {
    (async () => {
      await initDatabase();
      if (!recordId) return;
      const row = await getPatientTransferById(recordId);
      if (!row) return;
      setInitialSvg(row[fieldFor(target)] || null);
    })();
  }, [recordId, target]);

  const onClear = () => {
    padRef.current?.clear(); // no borra en BD
  };

  const onSave = async () => {
    const svg = padRef.current?.toSvg();
    if (!svg || !svg.includes('<path')) {
      Alert.alert('Sin firma', 'Dibuja la firma antes de guardar.');
      return;
    }
    await updatePatientTransfer(recordId, { [fieldFor(target)]: svg });
    // al volver, PatientTransferScreen refresca y mostrará “Firmado ✓”
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Firma ({target})</Text>

      <SignaturePad ref={padRef} initialSvg={initialSvg} />

      <View style={styles.actions}>
        <TouchableOpacity style={[styles.btn, styles.btnOutline]} onPress={onClear}>
          <Text style={[styles.btnTxt, styles.btnOutlineTxt]}>Limpiar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.btn} onPress={onSave}>
          <Text style={styles.btnTxt}>Guardar</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.helper}>
        “Limpiar” sólo borra lo que ves ahora. Si sales sin guardar, se mantendrá la firma previa.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 16 },
  label: { fontSize: 16, fontWeight: '700', marginBottom: 10 },
  actions: {
    marginTop: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
  },
  btn: {
    backgroundColor: '#20b2aa',
    paddingVertical: 12,
    paddingHorizontal: 22,
    borderRadius: 10,
    minWidth: 120,
    alignItems: 'center',
  },
  btnTxt: { color: '#fff', fontWeight: '700' },
  btnOutline: { backgroundColor: '#fff', borderWidth: 1.5, borderColor: '#20b2aa' },
  btnOutlineTxt: { color: '#20b2aa' },
  helper: { marginTop: 10, fontSize: 12, color: '#555', textAlign: 'center' },
});
