// app/(tabs)/PatientTransferScreen.js
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';

import FloatingLabelInput from '../components/FloatingLabelInput';
import CustomPicker from '../components/CustomPicker';
import RedirectButton from '../components/RedirectButton';

import {
  initDatabase,
  insertRecord,
  createAllStubs,
  updateRecord,
  updatePatientTransfer,
  getPatientTransferById,
  getSessionRecordId,
  setSessionRecordId
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

  const paramedicNames = [
    'TSUP Rodrigo de Jesus Guitierrez Vega',
    'Dalto',
    'Bryan'
  ];
  const doctorNames = ['Dr. House', 'Dr. Who', 'Dr. Strange'];

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
    setRecordId(null);
  };

  // 1) Si pulsaste “Nuevo” en Home, limpiar todo
  useFocusEffect(useCallback(() => {
    if (getSessionRecordId() === null) {
      clearForm();
    }
  }, []));

  // 2) Inicializa BD y carga datos previos
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
    })();
  }, [paramId]);

  // 3) Función de guardado / terminar más tarde
  const onSave = async (statusLabel) => {
    let id = recordId;
    if (!id) {
      const now = new Date();
      id = await insertRecord({
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
        rightful: ''
      }, statusLabel);
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
      doctorName
    });

    Alert.alert(
      statusLabel === 'saved' ? 'Guardado' : 'Pendiente',
      `Traslado ID ${id} → status: ${statusLabel}`
    );

    // Navegar a Home o donde quieras
    router.push({
     pathname: '/DeployedResourcesScreen',
     params: { recordId: id }
   });
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.mainContent}
        nestedScrollEnabled
      >
        <Text style={styles.title}>Traslado de paciente</Text>
        <Text style={styles.subtitle}>Expediente médico</Text>
        <Image
          style={styles.image}
          source={require('../assets/doctor.png')}
        />

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

        <View style={styles.signature}>
          <View style={styles.signatureInput}>
            <FloatingLabelInput
              label="Nombre del paciente"
              iconName="person"
              value={patientName}
              onChangeText={setPatientName}
            />
          </View>
          <View style={styles.signatureButton}>
            <RedirectButton
              refName="(signature)/SignatureTestScreen"
              iconName="edit-square"
            />
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

        <View style={styles.signature}>
          <View style={styles.signatureInput}>
            <CustomPicker
              label="Entrega a paciente"
              selectedValue={paramedicName}
              onValueChange={setParamedicName}
              options={paramedicNames}
            />
          </View>
          <View style={styles.signatureButton}>
            <RedirectButton
              refName="(signature)/SignatureTestScreen"
              iconName="edit-square"
            />
          </View>
        </View>

        <View style={styles.signature}>
          <View style={styles.signatureInput}>
            <FloatingLabelInput
              label="Médico que recibe"
              iconName="person"
              value={doctorName}
              onChangeText={setDoctorName}
            />
          </View>
          <View style={styles.signatureButton}>
            <RedirectButton
              refName="(signature)/SignatureTestScreen"
              iconName="edit-square"
            />
          </View>
        </View>

        <TouchableOpacity
          style={styles.saveButton}
          onPress={() => onSave('saved')}
        >
          <Text style={styles.buttonText}>Guardar</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.pendingButton}
          onPress={() => onSave('pending')}
        >
          <Text style={styles.buttonText}>Terminar más tarde</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5'
  },
  mainContent: {
    padding: 20,
    alignItems: 'center'
  },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 10 },
  subtitle: { fontSize: 18, fontWeight: '600', color: '#555', marginBottom: 20 },
  image: { width: 100, height: 100, marginBottom: 20, borderRadius: 8 },
  loremContainer: {
    width: '100%',
    height: 150,
    backgroundColor: '#ddda',
    borderRadius: 8,
    justifyContent: 'center',
    padding: 10,
    marginBottom: 20
  },
  loremText: { fontSize: 14, color: '#666', textAlign: 'justify' },
  sectionSubtitle: { fontSize: 16, fontWeight: '600', color: '#444', alignSelf: 'flex-start', marginTop: 20 },
  signature: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginTop: 10 },
  signatureInput: { width: '75%' },
  signatureButton: { width: '20%' },
  saveButton: {
    backgroundColor: '#28a745',
    padding: 12,
    borderRadius: 8,
    width: '100%',
    marginTop: 20
  },
  pendingButton: {
    backgroundColor: '#6c757d',
    padding: 12,
    borderRadius: 8,
    width: '100%',
    marginTop: 10
  },
  buttonText: { color: 'white', textAlign: 'center', fontWeight: 'bold' }
});
