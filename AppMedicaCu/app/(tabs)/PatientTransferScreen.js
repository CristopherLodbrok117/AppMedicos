// app/(tabs)/PatientTransferScreen.js
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

  // Nunca “congeles” el ID: adopta siempre el de sesión si existe.
  const [recordId, setRecordId] = useState(null);

  // Formulario
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

  // Firmas (solo UI)
  const [patientSignatureSvg, setPatientSignatureSvg] = useState(null);
  const [paramedicSignatureSvg, setParamedicSignatureSvg] = useState(null);
  const [doctorSignatureSvg, setDoctorSignatureSvg] = useState(null);
  const [witnessSignatureSvg, setWitnessSignatureSvg] = useState(null);

  // Para no sobreescribir lo que el usuario ya escribió cuando regresa de firmar
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);

  const paramedicNames = [
    'TSUP Rodrigo de Jesus Guitierrez Vega',
    'Dalto',
    'Bryan',
  ];

  const resetFields = () => {
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
    setWitnessSignatureSvg(null);
  };

  const clearAll = () => {
    resetFields();
    setRecordId(null);
    setHasLoadedOnce(false);
  };

  // Guarda en borrador sin alerts (para navegar a firmar sin perder nada)
  const saveDraftSilent = async () => {
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
        'pending'
      );
      await createAllStubs(id);
      setRecordId(id);
    } else {
      await updateRecord(id, { status: 'pending' });
    }
    setSessionRecordId(id);

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
      // firmas se guardan en SignatureTestScreen
    });

    return id;
  };

  // En cada foco, adopta siempre el ID de sesión (session-first)
  useFocusEffect(
    useCallback(() => {
      (async () => {
        await initDatabase();

        const sid = getSessionRecordId();             // sesión manda
        const effectiveId = (sid ?? paramId) ?? null; // (sesión) || (parámetro) || null

        if (!effectiveId) { clearAll(); return; }

        // Si cambió el ID efectivo, resetea y carga de cero
        const firstLoadForThisId = recordId !== effectiveId;
        if (firstLoadForThisId) {
          setRecordId(effectiveId);
          resetFields();
          setHasLoadedOnce(false);
        }

        await createAllStubs(effectiveId);

        const prev = await getPatientTransferById(effectiveId);
        if (!prev) return;

        // Solo poblar desde DB la primera vez para este ID;
        // si el usuario vuelve de firmar, no pisamos lo que ya está en memoria.
        if (!hasLoadedOnce || firstLoadForThisId) {
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
          setWitnessSignatureSvg(prev.witnessSignatureSvg || null);

          setHasLoadedOnce(true);
        }
      })();
    }, [paramId, recordId, hasLoadedOnce])
  );

  // primer montaje: intenta adoptar sesión/param
  useEffect(() => {
    (async () => {
      await initDatabase();
      const sid = getSessionRecordId();
      const effectiveId = (sid ?? paramId) ?? null;
      if (!effectiveId) return;
      setRecordId(effectiveId);
    })();
  }, [paramId]);

  // Guardar / terminar más tarde (con alert)
  const onSave = async (statusLabel) => {
    const id = await saveDraftSilent(); // ya crea/actualiza y fija sesión
    await updateRecord(id, { status: statusLabel });

    Alert.alert(
      statusLabel === 'saved' ? 'Guardado' : 'Pendiente',
      `Traslado ID ${id} → status: ${statusLabel}`
    );
  };

  const openSignature = async (target) => {
    const id = await saveDraftSilent(); // autosave para no perder lo escrito
    if (!id) {
      Alert.alert('Sin expediente', 'No se pudo crear/cargar el expediente.');
      return;
    }

    const targetMap = { patient: 'patient', witness: 'witness', paramedic: 'paramedic', doctor: 'doctor' };
    const t = targetMap[target] || 'patient';

    router.push({
      pathname: '/(signature)/SignatureTestScreen',
      params: { recordId: id, target: t, returnTo: '/PatientTransferScreen' },
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

        {/* ───── Deslinde de responsabilidad (bajo Institución de traslado) ───── */}
        <View style={styles.disclaimerBox}>
          <Text style={styles.disclaimerTitle}>
            Negativa a recibir atención o ser trasladado (deslinde de responsabilidad)
          </Text>
          <Text style={styles.disclaimerText}>
            Mediante la presente declaro que no acepto el tratamiento y/o traslado a un hospital y reconozco que el
            personal del Centro Universitario de Ciencias Exactas e Ingenierías me recomendó lo anterior, por lo que
            eximo a dicho personal y a la Universidad de Guadalajara de la responsabilidad que pudiera derivar de
            haber respetado y cumplido mi decisión.
          </Text>
        </View>

        <Text style={styles.sectionSubtitle}>Información del paciente</Text>

        {/* Paciente + Firma */}
        <View style={styles.row}>
          <View style={styles.flex75}>
            <FloatingLabelInput
              label="Nombre del paciente"
              iconName="person"
              value={patientName}
              onChangeText={setPatientName}
            />
            {patientSignatureSvg ? <Text style={styles.signedTxt}>Firmado ✓</Text> : null}
          </View>
          <View style={styles.flex20}>
            <TouchableOpacity style={styles.signBtn} onPress={() => openSignature('patient')}>
              <Text style={styles.signBtnTxt}>Firmar</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Testigo + Firma */}
        <View style={styles.row}>
          <View style={styles.flex75}>
            <FloatingLabelInput
              label="Nombre del testigo"
              iconName="person-outline"
              value={witnessName}
              onChangeText={setWitnessName}
            />
            {witnessSignatureSvg ? <Text style={styles.signedTxt}>Firmado ✓</Text> : null}
          </View>
          <View style={styles.flex20}>
            <TouchableOpacity style={styles.signBtn} onPress={() => openSignature('witness')}>
              <Text style={styles.signBtnTxt}>Firmar</Text>
            </TouchableOpacity>
          </View>
        </View>

        <FloatingLabelInput
          label="Observaciones"
          iconName="mode-edit"
          value={observations}
          onChangeText={setObservations}
        />

        <Text style={styles.sectionSubtitle}>Dependencias que atendieron al paciente</Text>

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
            {paramedicSignatureSvg ? <Text style={styles.signedTxt}>Firmado ✓</Text> : null}
          </View>
          <View style={styles.flex20}>
            <TouchableOpacity style={styles.signBtn} onPress={() => openSignature('paramedic')}>
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
            {doctorSignatureSvg ? <Text style={styles.signedTxt}>Firmado ✓</Text> : null}
          </View>
          <View style={styles.flex20}>
            <TouchableOpacity style={styles.signBtn} onPress={() => openSignature('doctor')}>
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

  // Disclaimer
  disclaimerBox: {
    width: '100%',
    backgroundColor: '#eeeeee',
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
  },
  disclaimerTitle: {
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 6,
  },
  disclaimerText: {
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'justify',
  },

  sectionSubtitle: {
    fontSize: 16, fontWeight: '600', color: '#444',
    alignSelf: 'flex-start', marginTop: 20,
  },

  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginTop: 10 },
  flex75: { width: '75%' },
  flex20: { width: '20%', alignItems: 'center', alignSelf: 'center' },

  signBtn: { backgroundColor: '#20b2aa', paddingVertical: 12, paddingHorizontal: 8, borderRadius: 8, alignItems: 'center' },
  signBtnTxt: { color: '#fff', fontWeight: '600' },
  signedTxt: { marginTop: 6, color: '#2f855a', fontWeight: '600' },

  saveButton: { backgroundColor: '#28a745', padding: 12, borderRadius: 8, width: '100%', marginTop: 20 },
  pendingButton: { backgroundColor: '#6c757d', padding: 12, borderRadius: 8, width: '100%', marginTop: 10 },
  buttonText: { color: 'white', textAlign: 'center', fontWeight: 'bold' },
});
