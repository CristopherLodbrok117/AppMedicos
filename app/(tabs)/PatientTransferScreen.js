import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, Image, ScrollView, TouchableOpacity,
  StyleSheet, Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';

import FloatingLabelInput from '../components/FloatingLabelInput';
import CustomPicker from '../components/CustomPicker';

import {
  initDatabase,
  insertRecord,
  createAllStubs,
  updateRecord,
  updatePatientTransfer,
  getPatientTransferById,
  getSessionRecordId,
  setSessionRecordId,
} from '../../services/database';

export default function PatientTransferScreen() {
  const { recordId: rawParam } = useLocalSearchParams();
  const paramId = rawParam ? parseInt(rawParam, 10) : null;
  const router = useRouter();

  const [recordId, setRecordId] = useState(paramId || getSessionRecordId());

  // Campos del formulario
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

  // Estados de firma (solo para mostrar “Firmado ✓”)
  const [patientSignatureSvg, setPatientSignatureSvg] = useState(null);
  const [paramedicSignatureSvg, setParamedicSignatureSvg] = useState(null);
  const [doctorSignatureSvg, setDoctorSignatureSvg] = useState(null);

  const paramedicNames = [
    'TSUP Rodrigo de Jesus Guitierrez Vega',
    'Dalto',
    'Bryan',
  ];

  const clearForm = () => {
    setInstitution('');
    setPatientName('');
    setWitnessName('');
    setObservations('');
    setDependencies('');
    setUnits('');
    setOfficerName('');
    setBelongings('');
    setReceiver('');
    setParamedicName('');
    setDoctorName('');
    setPatientSignatureSvg(null);
    setParamedicSignatureSvg(null);
    setDoctorSignatureSvg(null);
    setRecordId(null);
  };

  // Si pulsaste “Nuevo” en Home, limpiar todo
  useFocusEffect(
    useCallback(() => {
      if (getSessionRecordId() === null) clearForm();
    }, [])
  );

  // Cargar datos al montar y cuando cambia el paramId
  useEffect(() => {
    (async () => {
      await initDatabase();
      const id = paramId || getSessionRecordId();
      if (!id) return;
      setRecordId(id);
      await createAllStubs(id);
      const prev = await getPatientTransferById(id);
      if (!prev) return;
      setInstitution(prev.institution || '');
      setPatientName(prev.patientName || '');
      setWitnessName(prev.witnessName || '');
      setObservations(prev.observations || '');
      setDependencies(prev.dependencies || '');
      setUnits(prev.units || '');
      setOfficerName(prev.officerName || '');
      setBelongings(prev.belongings || '');
      setReceiver(prev.receiver || '');
      setParamedicName(prev.paramedicName || '');
      setDoctorName(prev.doctorName || '');
      setPatientSignatureSvg(prev.patientSignatureSvg || null);
      setParamedicSignatureSvg(prev.paramedicSignatureSvg || null);
      setDoctorSignatureSvg(prev.doctorSignatureSvg || null);
    })();
  }, [paramId]);

  // IMPORTANTe: refrescar firmas al volver de la pantalla de firma
  useFocusEffect(
    useCallback(() => {
      (async () => {
        if (!recordId) return;
        const prev = await getPatientTransferById(recordId);
        if (!prev) return;
        setPatientSignatureSvg(prev.patientSignatureSvg || null);
        setParamedicSignatureSvg(prev.paramedicSignatureSvg || null);
        setDoctorSignatureSvg(prev.doctorSignatureSvg || null);
      })();
    }, [recordId])
  );

  // Guardar / terminar más tarde
  const onSave = async (statusLabel) => {
    let id = recordId;
    if (!id) {
      const now = new Date();
      id = await insertRecord(
        {
          date: now.toISOString().slice(0, 10),
          time: now.toTimeString().slice(0, 8),
          weekDay: '',
          attentionReason: '',
          serviceLocation: '',
          vehicleType: '',
          vehicleNum: '',
          operator: '',
          intern: '',
          moreInterns: '',
          affiliation: '',
          gender: '',
          age: '',
          address: '',
          colony: '',
          municipality: '',
          phone: '',
          rightful: '',
        },
        statusLabel
      );
      await createAllStubs(id);
      setSessionRecordId(id);
      setRecordId(id);
    } else {
      await updateRecord(id, { status: statusLabel });
    }

    await updatePatientTransfer(id, {
      institution,
      patientName,
      witnessName,
      observations,
      dependencies,
      units,
      officerName,
      belongings,
      receiver,
      paramedicName,
      doctorName,
      // las firmas se guardan en SignatureTestScreen
    });

    Alert.alert(
      statusLabel === 'saved' ? 'Guardado' : 'Pendiente',
      `Traslado ID ${id} → status: ${statusLabel}`
    );

    // Navega a la siguiente pantalla si quieres
    // router.push({ pathname: '/DeployedResourcesScreen', params: { recordId: id } });
  };

  const openSignature = (target) => {
    if (!recordId) {
      Alert.alert(
        'Sin expediente',
        'Primero guarda o marca como pendiente para crear el expediente.'
      );
      return;
    }
    router.push({
      pathname: '/(signature)/SignatureTestScreen',
      params: { recordId, target, returnTo: '/PatientTransferScreen' },
    });
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.mainContent} nestedScrollEnabled>
        <Text style={styles.title}>Traslado de paciente</Text>
        <Text style={styles.subtitle}>Expediente médico</Text>
        <Image style={styles.image} source={require('../assets/doctor.png')} />

        <FloatingLabelInput
          label="Institución de traslado"
          iconName="location-pin"
          value={institution}
          onChangeText={setInstitution}
        />

        <View style={styles.loremContainer}>
          <Text style={styles.loremText}>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer nec
            odio. Praesent libero. Sed cursus ante dapibus diam.
          </Text>
        </View>

        <Text style={styles.sectionSubtitle}>Información del paciente</Text>

        {/* Paciente + Firma */}
        <View className="row" style={styles.row}>
          <View style={styles.flex75}>
            <FloatingLabelInput
              label="Nombre del paciente"
              iconName="person"
              value={patientName}
              onChangeText={setPatientName}
            />
            {patientSignatureSvg ? (
              <Text style={styles.signedTxt}>Firmado ✓</Text>
            ) : null}
          </View>
          <View style={styles.flex20}>
            <TouchableOpacity
              style={styles.signBtn}
              onPress={() => openSignature('patient')}
            >
              <Text style={styles.signBtnTxt}>Firmar</Text>
            </TouchableOpacity>
          </View>
        </View>

        <FloatingLabelInput
          label="Nombre del testigo"
          iconName="person-outline"
          value={witnessName}
          onChangeText={setWitnessName}
        />
        <FloatingLabelInput
          label="Observaciones"
          iconName="mode-edit"
          value={observations}
          onChangeText={setObservations}
        />

        <Text style={styles.sectionSubtitle}>
          Dependencias que atendieron al paciente
        </Text>

        <FloatingLabelInput
          label="Dependencias"
          iconName="apartment"
          value={dependencies}
          onChangeText={setDependencies}
        />
        <FloatingLabelInput
          label="Número de unidades"
          iconName="fire-truck"
          value={units}
          onChangeText={setUnits}
        />
        <FloatingLabelInput
          label="Encargado / oficial"
          iconName="person-4"
          value={officerName}
          onChangeText={setOfficerName}
        />
        <FloatingLabelInput
          label="Pertenencias"
          iconName="backpack"
          value={belongings}
          onChangeText={setBelongings}
        />
        <FloatingLabelInput
          label="Recibe pertenencias"
          iconName="mode-edit"
          value={receiver}
          onChangeText={setReceiver}
        />

        {/* Paramédico + Firma */}
        <View style={styles.row}>
          <View style={styles.flex75}>
            <CustomPicker
              label="Entrega a paciente"
              selectedValue={paramedicName}
              onValueChange={setParamedicName}
              options={paramedicNames}
            />
            {paramedicSignatureSvg ? (
              <Text style={styles.signedTxt}>Firmado ✓</Text>
            ) : null}
          </View>
          <View style={styles.flex20}>
            <TouchableOpacity
              style={styles.signBtn}
              onPress={() => openSignature('paramedic')}
            >
              <Text style={styles.signBtnTxt}>Firmar</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Médico + Firma */}
        <View style={styles.row}>
          <View style={styles.flex75}>
            <FloatingLabelInput
              label="Médico que recibe"
              iconName="person"
              value={doctorName}
              onChangeText={setDoctorName}
            />
            {doctorSignatureSvg ? (
              <Text style={styles.signedTxt}>Firmado ✓</Text>
            ) : null}
          </View>
          <View style={styles.flex20}>
            <TouchableOpacity
              style={styles.signBtn}
              onPress={() => openSignature('doctor')}
            >
              <Text style={styles.signBtnTxt}>Firmar</Text>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity style={styles.saveButton} onPress={() => onSave('saved')}>
          <Text style={styles.buttonText}>Guardar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.pendingButton} onPress={() => onSave('pending')}>
          <Text style={styles.buttonText}>Terminar más tarde</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

// ──────────────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  mainContent: { padding: 20, alignItems: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 10 },
  subtitle: { fontSize: 18, fontWeight: '600', color: '#555', marginBottom: 20 },
  image: { width: 100, height: 100, marginBottom: 20, borderRadius: 8 },
  loremContainer: {
    width: '100%', height: 150, backgroundColor: '#ddda',
    borderRadius: 8, justifyContent: 'center', padding: 10, marginBottom: 20,
  },
  loremText: { fontSize: 14, color: '#666', textAlign: 'justify' },
  sectionSubtitle: {
    fontSize: 16, fontWeight: '600', color: '#444',
    alignSelf: 'flex-start', marginTop: 20,
  },

  row: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',  
  width: '100%',
  marginTop: 10,
},
  flex75: { width: '75%' },
  flex20: { width: '20%', alignItems: 'center', alignSelf: 'center' } ,

  signBtn: { backgroundColor: '#20b2aa', paddingVertical: 12, paddingHorizontal: 8, borderRadius: 8, alignItems: 'center' },
  signBtnTxt: { color: '#fff', fontWeight: '600' },
  signedTxt: { marginTop: 6, color: '#2f855a', fontWeight: '600' },

  saveButton: { backgroundColor: '#28a745', padding: 12, borderRadius: 8, width: '100%', marginTop: 20 },
  pendingButton: { backgroundColor: '#6c757d', padding: 12, borderRadius: 8, width: '100%', marginTop: 10 },
  buttonText: { color: 'white', textAlign: 'center', fontWeight: 'bold' },
});
