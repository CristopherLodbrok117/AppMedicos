// app/(tabs)/PatientConditionScreen.js
import React, { useState, useEffect, useCallback } from 'react';
import {
  ScrollView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';

import CustomPicker from '../components/CustomPicker';
import FloatingLabelInput from '../components/FloatingLabelInput';

import {
  initDatabase,
  insertRecord,
  createAllStubs,
  updatePatientCondition,
  updateRecord,
  getPatientConditionById,
  getRecordById,
  getSessionRecordId,
  setSessionRecordId,
} from '../../services/database';

const NA = 'No aplica';
const naToNull = (v) => (v && v !== NA ? v : null);

export default function PatientConditionScreen() {
  const { recordId: rawParam } = useLocalSearchParams();
  const paramId = rawParam ? parseInt(rawParam, 10) : null;
  const router = useRouter();

  // ✅ Tomar paramId o sesión solo al primer render
  const [recordId, setRecordId] = useState(() => paramId ?? getSessionRecordId() ?? null);

  // Estado del expediente
  const [status, setStatus] = useState('pending');
  const isLocked = status === 'saved';

  // ===== NUEVOS CAMPOS (cabecera) =====
  const [criticality, setCriticality]     = useState(NA); // Crítico / No crítico / No aplica
  const [glasgow, setGlasgow]             = useState('');
  const [ventFrequency, setVentFrequency] = useState('');
  const [ventVolume, setVentVolume]       = useState('');
  const [oxygenLpm, setOxygenLpm]         = useState('');

  // VÍAS VENOSAS / SOLUCIONES (NUEVOS)
  const [ivLines, setIvLines]                   = useState('');
  const [catheterNum, setCatheterNum]           = useState('');
  const [solutionAmount, setSolutionAmount]     = useState('');
  const [solutionInfusions, setSolutionInfusions] = useState('');

  // ===== CAMPOS EXISTENTES =====
  const [stability, setStability]             = useState(NA);
  const [patientColor, setPatientColor]       = useState(NA);
  const [airway, setAirway]                   = useState(NA);
  const [decompression, setDecompression]     = useState(NA);
  const [side, setSide]                       = useState(NA);
  const [cervical, setCervical]               = useState(NA);
  const [ventilatoryHelp, setVentilatoryHelp] = useState(NA);
  const [oxygenTherapy, setOxygenTherapy]     = useState(NA);
  const [hemorrhageCtrl, setHemorrhageCtrl]   = useState(NA);
  const [solutionType, setSolutionType]       = useState(NA);
  const [rcp, setRcp]                         = useState(NA);

  // ===== NUEVOS: debajo de RCP =====
  const [immobilization, setImmobilization] = useState(NA);
  const [curation, setCuration]             = useState(NA);
  const [bandage, setBandage]               = useState(NA);

  // ===== TABLA: Manejo farmacológico y terapia eléctrica (3 filas fijas) =====
  const newPharmaRow = () => ({ time: '', med: '', dose: '', route: '', electric: '' });
  const [pharmaRows, setPharmaRows] = useState([newPharmaRow(), newPharmaRow(), newPharmaRow()]);
  const setCell = (i, key, val) =>
    setPharmaRows(rows => rows.map((r, idx) => (idx === i ? { ...r, [key]: val } : r)));

  // Opciones (todas con No aplica y por defecto)
  const criticalityItems     = [NA, 'Crítico', 'No crítico'];
  const stabilityItems       = [NA, 'Si', 'No'];
  const patientColors        = [NA, 'Rojo', 'Amarillo', 'Verde', 'Negra'];
  const airways              = [NA, 'Aspiración', 'Cánula orofaríngea', 'Cánula nasofaríngea', 'Intubación endotraqueal', 'Mascarilla laríngea', 'Combitubo', 'Cricotirodotomía'];
  const decompressionItems   = [NA, 'Si', 'No'];
  const sides                = [NA, 'Derecho', 'Izquierdo'];
  const cervicals            = [NA, 'Manual', 'Collarín', 'Collarín blando'];
  const ventilatoryHelpItems = [NA, 'BVM', 'Ventilador automático'];
  const oxygenTherapyItems   = [NA, 'Puntas nasales', 'Mascarilla simple', 'Reservorio', 'Venturi'];
  const hemorrhageItems      = [NA, 'Presión directa', 'Indirecta', 'Gravedad', 'Vendaje compresivo', 'Crioterapia', 'Hemostático'];
  const solutionTypes        = [NA, 'Hartman', 'NaCl 0.9%', 'Mixta', 'Glucosa 5%'];
  const rcps                 = [NA, 'RCP básica', 'RCP avanzada'];

  // NUEVO: inmovilización/curación/vendaje
  const immobilizationItems  = [NA, 'Inmovilización de extremidades', 'Inmovilización en FEL'];
  const curationItems        = [NA, 'Si'];
  const bandageItems         = [NA, 'Si'];

  const clearForm = () => {
    setCriticality(NA); setGlasgow(''); setVentFrequency(''); setVentVolume(''); setOxygenLpm('');
    setIvLines(''); setCatheterNum(''); setSolutionAmount(''); setSolutionInfusions('');
    setStability(NA); setPatientColor(NA); setAirway(NA); setDecompression(NA); setSide(NA);
    setCervical(NA); setVentilatoryHelp(NA); setOxygenTherapy(NA); setHemorrhageCtrl(NA);
    setSolutionType(NA); setRcp(NA); setStatus('pending');
    setImmobilization(NA); setCuration(NA); setBandage(NA);
    setPharmaRows([newPharmaRow(), newPharmaRow(), newPharmaRow()]);
  };

  // 🔁 Al ganar foco, adoptar siempre el SessionRecordId (session-first)
  useFocusEffect(
    useCallback(() => {
      const sid = getSessionRecordId(); // puede ser null
      if (sid !== recordId) {
        clearForm();
        setRecordId(sid ?? null);
      }
    }, [recordId])
  );

  // 📥 Cargar datos cuando cambia el ID efectivo
  useEffect(() => {
    (async () => {
      await initDatabase();
      if (!recordId) return;

      await createAllStubs(recordId);

      const rec = await getRecordById(recordId);
      if (rec && rec.status) setStatus(rec.status);

      const prev = await getPatientConditionById(recordId);
      if (prev) {
        setCriticality(prev.criticality ?? NA);
        setGlasgow(prev.glasgow ?? '');
        setVentFrequency(prev.ventFrequency ?? '');
        setVentVolume(prev.ventVolume ?? '');
        setOxygenLpm(prev.oxygenLpm ?? '');
        setIvLines(prev.ivLines ?? '');
        setCatheterNum(prev.catheterNum ?? '');
        setSolutionAmount(prev.solutionAmount ?? '');
        setSolutionInfusions(prev.solutionInfusions ?? '');
        setStability(prev.stability ?? NA);
        setPatientColor(prev.patientColor ?? NA);
        setAirway(prev.airway ?? NA);
        setDecompression(prev.decompression ?? NA);
        setSide(prev.side ?? NA);
        setCervical(prev.cervical ?? NA);
        setVentilatoryHelp(prev.ventilatoryHelp ?? NA);
        setOxygenTherapy(prev.oxygenTherapy ?? NA);
        setHemorrhageCtrl(prev.hemorrhageCtrl ?? NA);
        setSolutionType(prev.solutionType ?? NA);
        setRcp(prev.rcp ?? NA);
        setImmobilization(prev.immobilization ?? NA);
        setCuration(prev.curation ?? NA);
        setBandage(prev.bandage ?? NA);
        try {
          if (prev.pharmaTherapyRows) {
            const parsed = JSON.parse(prev.pharmaTherapyRows);
            if (Array.isArray(parsed) && parsed.length) {
              // Garantizar exactamente 3 filas: rellenar o recortar
              const three = [newPharmaRow(), newPharmaRow(), newPharmaRow()];
              parsed.slice(0, 3).forEach((row, i) => { three[i] = { ...three[i], ...row }; });
              setPharmaRows(three);
            }
          }
        } catch {}
      }
    })();
  }, [recordId]);

  const handleNext = async () => {
    if (isLocked) {
      Alert.alert('Expediente finalizado', 'Este expediente ya está firmado y no puede editarse.');
      return;
    }

    let id = recordId;
    if (!id) {
      const now = new Date();
      id = await insertRecord({
        date: now.toISOString().slice(0,10),
        time: now.toTimeString().slice(0,8),
        weekDay:'', attentionReason:'', serviceLocation:'',
        vehicleType:'', vehicleNum:'', operator:'',
        intern:'', moreInterns:'', affiliation:'',
        gender:'', age:'', address:'', colony:'',
        municipality:'', phone:'', rightful:''
      }, 'pending');
      await createAllStubs(id);
      setSessionRecordId(id);
      setRecordId(id);
    } else {
      await updateRecord(id, { status: 'pending' });
      setStatus('pending');
    }

    const nowTime = new Date().toTimeString().slice(0,8);

    await updatePatientCondition(id, {
      // Marca de tiempo de esta sección
      time: nowTime,

      // Campos que NO deben guardar "No aplica"
      stability:         naToNull(stability),
      patientColor:      naToNull(patientColor),
      airway:            naToNull(airway),
      decompression:     naToNull(decompression),
      side:              naToNull(side),
      cervical:          naToNull(cervical),
      ventilatoryHelp:   naToNull(ventilatoryHelp),
      oxygenTherapy:     naToNull(oxygenTherapy),
      hemorrhageCtrl:    naToNull(hemorrhageCtrl),
      solutionType:      naToNull(solutionType),
      rcp:               naToNull(rcp),
      criticality:       naToNull(criticality),
      immobilization:    naToNull(immobilization),
      curation:          naToNull(curation),
      bandage:           naToNull(bandage),

      // Numéricos / texto libre
      glasgow,
      ventFrequency,
      ventVolume,
      oxygenLpm,
      ivLines,
      catheterNum,
      solutionAmount,
      solutionInfusions,

      // Tabla fija (3 filas)
      pharmaTherapyRows: JSON.stringify(pharmaRows),
    });

    Alert.alert('Guardado', `Condición del paciente ID ${id} → borrador`);
    router.push({ pathname: '/PatientTransferScreen', params: { recordId: id } });
  };

  const showO2Liters = oxygenTherapy && oxygenTherapy !== NA;

  return (
    <ScrollView contentContainerStyle={styles.container} nestedScrollEnabled>
      <Text style={styles.title}>Condición del Paciente</Text>
      <Text style={styles.subtitle}>Expediente médico</Text>
      <Image style={styles.image} source={require('../assets/doctor.png')} />

      <CustomPicker label="Condición del paciente" selectedValue={criticality} onValueChange={setCriticality} options={criticalityItems} enabled={!isLocked} />

      <CustomPicker label="Se encuentra estable"      selectedValue={stability}       onValueChange={setStability}       options={stabilityItems}       enabled={!isLocked} />
      <CustomPicker label="Color del paciente"        selectedValue={patientColor}    onValueChange={setPatientColor}    options={patientColors}        enabled={!isLocked} />

      <FloatingLabelInput label="Glasgow" value={glasgow} onChangeText={setGlasgow} editable={!isLocked} iconName="analytics" keyboardType="numeric" />

      <CustomPicker label="Vía aérea"                 selectedValue={airway}          onValueChange={setAirway}          options={airways}              enabled={!isLocked} />
      <CustomPicker label="Descompresión pleural"     selectedValue={decompression}   onValueChange={setDecompression}   options={decompressionItems}   enabled={!isLocked} />
      <CustomPicker label="Lado"                      selectedValue={side}            onValueChange={setSide}            options={sides}                enabled={!isLocked} />
      <CustomPicker label="Control cervical"          selectedValue={cervical}        onValueChange={setCervical}        options={cervicals}            enabled={!isLocked} />

      <CustomPicker label="Asistencia ventilatoria"   selectedValue={ventilatoryHelp} onValueChange={setVentilatoryHelp} options={ventilatoryHelpItems} enabled={!isLocked} />
      <FloatingLabelInput label="Frecuencia" value={ventFrequency} onChangeText={setVentFrequency} editable={!isLocked} iconName="speed" keyboardType="numeric" />
      <FloatingLabelInput label="Vol"         value={ventVolume}    onChangeText={setVentVolume}    editable={!isLocked} iconName="swap-vert" keyboardType="numeric" />

      <CustomPicker label="Oxigenoterapia"            selectedValue={oxygenTherapy}   onValueChange={setOxygenTherapy}   options={oxygenTherapyItems}   enabled={!isLocked} />
      {showO2Liters && (
        <FloatingLabelInput label="Lts x min" value={oxygenLpm} onChangeText={setOxygenLpm} editable={!isLocked} iconName="air" keyboardType="numeric" />
      )}

      <CustomPicker label="Control de hemorragías"    selectedValue={hemorrhageCtrl}  onValueChange={setHemorrhageCtrl}  options={hemorrhageItems}      enabled={!isLocked} />

      {/* VÍAS VENOSAS */}
      <FloatingLabelInput label="Líneas IV #" value={ivLines} onChangeText={setIvLines} editable={!isLocked} iconName="local-hospital" keyboardType="numeric" />
      <FloatingLabelInput label="Catéter #"   value={catheterNum} onChangeText={setCatheterNum} editable={!isLocked} iconName="healing" keyboardType="numeric" />

      <CustomPicker label="Tipo de soluciones"        selectedValue={solutionType}    onValueChange={setSolutionType}    options={solutionTypes}        enabled={!isLocked} />
      <FloatingLabelInput label="Cantidad"    value={solutionAmount}    onChangeText={setSolutionAmount}    editable={!isLocked} iconName="format-list-numbered" keyboardType="numeric" />
      <FloatingLabelInput label="Infusiones"  value={solutionInfusions} onChangeText={setSolutionInfusions} editable={!isLocked} iconName="autorenew"            keyboardType="numeric" />

      {/* === TABLA: Manejo farmacológico y terapia eléctrica (3 filas) === */}
      <Text style={styles.sectionTitle}>Manejo farmacológico y terapia eléctrica</Text>
      <View style={styles.table}>
        <View style={[styles.row, styles.headerRow]}>
          <Text style={[styles.th, styles.colTime]}>Hora</Text>
          <Text style={[styles.th, styles.colMed]}>Medicamento</Text>
          <Text style={[styles.th, styles.colDose]}>Dosis</Text>
          <Text style={[styles.th, styles.colRoute]}>Vía de admin</Text>
          <Text style={[styles.th, styles.colElec, styles.noRightBorder]}>Terapia eléctrica</Text>
        </View>

        {pharmaRows.map((r, i) => (
          <View key={i} style={styles.row}>
            <TextInput style={[styles.tdInput, styles.colTime]}  value={r.time}     onChangeText={(t) => setCell(i, 'time', t)}     editable={!isLocked} placeholder="--:--" />
            <TextInput style={[styles.tdInput, styles.colMed]}   value={r.med}      onChangeText={(t) => setCell(i, 'med', t)}      editable={!isLocked} placeholder="Nombre" />
            <TextInput style={[styles.tdInput, styles.colDose]}  value={r.dose}     onChangeText={(t) => setCell(i, 'dose', t)}     editable={!isLocked} placeholder="mg/ml" />
            <TextInput style={[styles.tdInput, styles.colRoute]} value={r.route}    onChangeText={(t) => setCell(i, 'route', t)}    editable={!isLocked} placeholder="IV/IM/VO…" />
            <TextInput style={[styles.tdInput, styles.colElec, styles.noRightBorder]}  value={r.electric} onChangeText={(t) => setCell(i, 'electric', t)} editable={!isLocked} placeholder="Desf./Marcapaso…" />
          </View>
        ))}
      </View>

      <CustomPicker label="RCP" selectedValue={rcp} onValueChange={setRcp} options={rcps} enabled={!isLocked} />

      {/* ===== NUEVOS SELECTORES DEBAJO DE RCP ===== */}
      <CustomPicker label="Inmovilización" selectedValue={immobilization} onValueChange={setImmobilization} options={immobilizationItems} enabled={!isLocked} />
      <CustomPicker label="Curación" selectedValue={curation} onValueChange={setCuration} options={curationItems} enabled={!isLocked} />
      <CustomPicker label="Vendaje" selectedValue={bandage} onValueChange={setBandage} options={bandageItems} enabled={!isLocked} />

      {!isLocked && (
        <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
          <Text style={styles.buttonText}>Siguiente</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container:     { padding:20, alignItems:'center', backgroundColor:'#f5f5f5' },
  title:         { fontSize:24, fontWeight:'bold', marginBottom:10 },
  subtitle:      { fontSize:18, fontWeight:'600', color:'#555', marginBottom:20 },
  image:         { width:100, height:100, marginBottom:20, borderRadius:8 },

  sectionTitle:  { fontSize:16, fontWeight:'700', alignSelf:'flex-start', marginTop:18, marginBottom:8 },

  // ===== Tabla =====
  table:         { width:'100%', borderWidth:1, borderColor:'#ddd', borderRadius:8, overflow:'hidden', backgroundColor:'#fff' },
  row:           { flexDirection:'row', alignItems:'stretch' },
  headerRow:     { backgroundColor:'#f1f5f9' },
  th:            { paddingVertical:10, paddingHorizontal:8, fontWeight:'700', borderRightWidth:1, borderRightColor:'#e5e7eb', textAlign:'center' },
  tdInput:       { paddingVertical:8, paddingHorizontal:8, borderTopWidth:1, borderTopColor:'#e5e7eb', borderRightWidth:1, borderRightColor:'#e5e7eb' },
  noRightBorder: { borderRightWidth:0 },

  // Proporciones por columna
  colTime:  { flex: 1.1 },
  colMed:   { flex: 2.2 },
  colDose:  { flex: 1.2 },
  colRoute: { flex: 1.6 },
  colElec:  { flex: 1.8 },

  nextButton:    { backgroundColor:'#1f9aef', padding:12, borderRadius:8, width:'100%', marginTop:20 },
  buttonText:    { color:'#fff', textAlign:'center', fontWeight:'bold' },
});
