// app/(tabs)/DeployedResourcesScreen.js
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  ScrollView, View, Text, TouchableOpacity, StyleSheet,
  Image, Alert, TextInput
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';

import Resource from '../components/Resource';

import {
  initDatabase,
  insertRecord,
  createAllStubs,
  updateRecord,
  updateDeployedResources,
  getDeployedResourcesById,
  getSessionRecordId,
  setSessionRecordId
} from '../../services/database';

// =====================================================
//  Helpers: normalización → nombre de columna estable
// =====================================================
const toColumnName = (label) =>
  String(label)
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9_ ]/g, '')
    .trim()
    .replace(/\s+/g, '_');

// Alias para columnas con diferencias en el schema
const COLUMN_ALIASES = {
  'Agua inyectable 500 ml': 'agua_inyectable_500ml',
  'Burn free gel': 'burn_free_gel',
  'Desinfectante p/ manos': 'desinfectante_para_manos',
  'Desinfectante p/ superficies': 'desinfectante_para_superficies',
  'Cánula blanda de aspiración': 'canula_blanda_de_aspiracion',
  'Cánulas nasofaríngeas': 'canulas_nasofaringeas',
  'Cánulas orofaríngeas': 'canulas_orofaringeas',
  'Cánula yankawer': 'canula_yankawer',
  'Fijador de TE pediátrico': 'fijador_de_te_pediatrico',
  'Fijador de TE adulto': 'fijador_de_te_adulto',
  // Transpore (no “transporte”)
  'Cinta Transpore 3m 1”': 'cinta_transpore_3m_1',
  'Cinta Transpore 3m 2”': 'cinta_transpore_3m_2',
};

const labelToColumn = (label) => COLUMN_ALIASES[label] || toColumnName(label);

// =====================================================
//  Catálogo agrupado (secciones)
// =====================================================
const SECTION_DEFS = [
  {
    key: 'viaAerea',
    title: 'Vía aérea / Dispositivos',
    items: [
      'Cánula blanda de aspiración','Cánulas nasofaríngeas','Cánulas orofaríngeas','Cánula yankawer',
      'Mascarilla laríngea','Mascarilla Hudson','Mascarilla N-95','Mascarilla O2 adulto','Mascarilla O2 ped.',
      'Puntas nasales adulto','Tubos endotraqueales','Perilla','Manguera p/aspirador','Lentes de protección',
      'Lancetas p/glucómetro','Ligadura umbilical','Collarines desechables','Fijador de TE adulto','Fijador de TE pediátrico',
      'Catéter #12','Catéter #14','Catéter #16','Catéter #18','Catéter #20','Catéter #22','Catéter #24',
      'Microgoteros','Normogoteros',
    ],
  },
  {
    key: 'inyectables',
    title: 'Agujas / Jeringas',
    items: [
      'Agujas 20x32','Jeringa 1 ml','Jeringa 3 ml','Jeringa 5 ml','Jeringa 10 ml','Jeringa 20 ml','Jeringa asepto',
    ],
  },
  {
    key: 'textiles',
    title: 'Textiles / Vendajes',
    items: [
      'Campos estériles','Gasas estériles','Gasas no estériles',
      'Sábanas quirúrgicas','Sábanas térmicas','Sábanas desechables',
      'Venda #5','Venda #10','Venda #15','Venda #20','Venda #30',
      'Cinta Transpore 3m 1”','Cinta Transpore 3m 2”',
    ],
  },
  {
    key: 'soluciones',
    title: 'Soluciones y líquidos',
    items: [
      'Agua inyectable 500 ml','Sol CS 0.9% 1000 ml','Sol CS 0.9% 500 ml','Sol CS 0.9% 250 ml',
      'Sol HL 1000 ml','Sol HL 500 ml','Sol HL 250 ml',
      'Sol DX 1000 ml','Sol DX 500 ml','Sol DX 250 ml','Sol DX 50 ml',
      'Sol Gelafundin 500 ml','Sol Isodine 500 ml','Sol jabón quir. 500 ml',
    ],
  },
  {
    key: 'consumibles',
    title: 'Consumibles / Protección',
    items: [
      'Bata desechable','Bolsa negra','Bolsa roja','Bolsa amarilla','Burn free gel',
      'Cubrebocas','Desinfectante p/ manos','Desinfectante p/ superficies',
      'Algodón paquete','Jalea hidrosoluble','Tegaderm','Rastrillos','Quick clot',
      'Tiras reactivas','Torundero con alcohol','Torundero seco','Gel conductivo',
      'Electrodos adulto','Electrodos pediátrico',
      'Guantes estériles/pares','Guantes desechables/pares','Hojas de bisturí #20',
    ],
  },
  {
    key: 'meds',
    title: 'Medicamentos',
    items: [
      'Adrenalina 1 mg Amp','Agua inyectable Amp','Aspirina 100 mg Tab caja','Aspirina 500 mg Tab caja',
      'Avapena 1 mg Amp','Avapena 20 mg Amp','Butilhioscina 20 mg Amp','Captopril 25 mg Tab Amp',
      'Clorfenamina 10 mg Amp','Clorfenamina 500 mg Tab Amp','Cloruro de sodio 0.9% Amp',
      'Clonixinato 1 mg Amp','Dextrosa 0.5/2.5 mg Amp','Dexametasona 8 mg Amp','Diazepam 10 mg Amp',
      'Diclofenaco 75 mg Amp','Dx L 50% de 50 ml','Electrolitos orales','Fenitoína sódica','Flixotide Sol',
      'Furosemida 20 mg Amp','Hidrocortisona 100 mg Amp','Hidrocortisona 500 mg Amp','Isosorbide 5 mg',
      'Isosorbida Dinitrato Spray','Ketorolaco 30 mg Amp','Meclixina/piridoxina/lido Amp','Metamizol Sódico 1 gr Amp',
      'Metoclopramida 10 mg Amp','Midazolam 15 mg Amp','Omeprazol 40 mg Amp','Oxitocina Sui Amp','Panclasa 40 mg Amp',
      'Paracetamol Gotas','Paracetamol 500 mg Tab','Salbutamol  5 mg','Salbutamol aerosol','Sulfato de magnesio 1 gr',
      'Trinitrato de glicerilo Perlas','Hidralazina','Fitomenadiona',
    ],
  },
];

// Para construir la búsqueda
const ALL_LABELS = SECTION_DEFS.flatMap(s => s.items);

// =====================================================

export default function DeployedResourcesScreen() {
  const { recordId: rawParam } = useLocalSearchParams();
  const initialParamId = rawParam ? parseInt(rawParam, 10) : null;
  const router = useRouter();

  // 1) Solo usamos paramId en el PRIMER render. Después la sesión manda.
  const [recordId, setRecordId] = useState(() => initialParamId ?? getSessionRecordId() ?? null);
  const [quantities, setQuantities] = useState({}); // { colDB: number }
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(() =>
    Object.fromEntries(SECTION_DEFS.map(s => [s.key, false])) // todas cerradas
  );

  const clearForm = () => {
    setQuantities({});
    setQuery('');
  };

  // 2) En cada foco, sincroniza SIEMPRE con el SessionRecordId (gana sobre cualquier paramId anterior).
  useFocusEffect(
    useCallback(() => {
      const sid = getSessionRecordId(); // puede ser null o un número

      // Si la sesión cambió (incluido "Nuevo"), limpiamos y adoptamos el nuevo ID
      if (sid !== recordId) {
        clearForm();
        setRecordId(sid ?? null);
      }
    }, [recordId])
  );

  // 3) Carga/recarga cuando cambia el recordId efectivo
  useEffect(() => {
    (async () => {
      await initDatabase();
      if (!recordId) { setQuantities({}); return; }

      await createAllStubs(recordId);

      const row = await getDeployedResourcesById(recordId);
      if (row) {
        const { recordId: _ignore, ...cols } = row;
        const numericCols = Object.fromEntries(
          Object.entries(cols).map(([k, v]) => [k, Number(v) || 0])
        );
        setQuantities(numericCols);
      } else {
        setQuantities({});
      }
    })();
  }, [recordId]);

  // ======== Lógica UI ========
  const toggleSection = (key) => setOpen(o => ({ ...o, [key]: !o[key] }));

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return null;
    return ALL_LABELS.filter(lbl => lbl.toLowerCase().includes(q));
  }, [query]);

  const getQtyByLabel = (label) => quantities[labelToColumn(label)] || 0;

  const setQtyByLabel = (label, value) => {
    const col = labelToColumn(label);
    const val = Number(value);
    setQuantities(q => ({ ...q, [col]: Number.isFinite(val) ? val : 0 }));
  };

  const countSectionItems = (labels) =>
    labels.reduce((acc, lbl) => acc + (getQtyByLabel(lbl) || 0), 0);

  // ======== Guardar / Terminar más tarde ========
  const onSave = async (statusLabel) => {
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
      }, statusLabel);
      await createAllStubs(id);
    } else {
      await updateRecord(id, { status: statusLabel });
    }

    // Fijamos sesión y estado local al ID usado
    setSessionRecordId(id);
    setRecordId(id);

    await updateDeployedResources(id, quantities);

    // Evita que quede un paramId viejo en la ruta
    router.replace(`/DeployedResourcesScreen?recordId=${id}`);

    Alert.alert(
      statusLabel === 'saved' ? 'Guardado' : 'Pendiente',
      `Recursos ID ${id} → status: ${statusLabel}`
    );
  };

  return (
    <ScrollView contentContainerStyle={s.container} nestedScrollEnabled>
      <Text style={s.title}>Recursos Utilizados</Text>
      <Image style={s.image} source={require('../assets/doctor.png')} />

      {/* Buscador */}
      <TextInput
        style={s.search}
        placeholder="Buscar recurso o medicamento…"
        value={query}
        onChangeText={setQuery}
        clearButtonMode="while-editing"
      />

      {/* Si hay búsqueda, lista plana */}
      {filtered ? (
        <>
          <Text style={s.subtitle}>Resultados ({filtered.length})</Text>
          {filtered.map((label) => (
            <Resource
              key={label}
              name={label}
              quantity={getQtyByLabel(label)}
              onQuantityChange={(qty) => setQtyByLabel(label, qty)}
            />
          ))}
        </>
      ) : (
        // Si NO hay búsqueda, secciones plegables (cerradas por defecto)
        SECTION_DEFS.map(sec => {
          const total = countSectionItems(sec.items);
          return (
            <View key={sec.key} style={s.section}>
              <TouchableOpacity style={s.sectionHeader} onPress={() => toggleSection(sec.key)}>
                <Text style={s.sectionTitle}>{sec.title}</Text>
                <View style={s.sectionRight}>
                  {total > 0 ? <Text style={s.badge}>{total}</Text> : null}
                  <Text style={s.chevron}>{open[sec.key] ? '▾' : '▸'}</Text>
                </View>
              </TouchableOpacity>

              {open[sec.key] && (
                <View style={s.sectionBody}>
                  {sec.items.map((label) => (
                    <Resource
                      key={label}
                      name={label}
                      quantity={getQtyByLabel(label)}
                      onQuantityChange={(qty) => setQtyByLabel(label, qty)}
                    />
                  ))}
                </View>
              )}
            </View>
          );
        })
      )}

      {/* Acciones */}
      <TouchableOpacity style={s.saveButton} onPress={() => onSave('saved')}>
        <Text style={s.buttonText}>Guardar</Text>
      </TouchableOpacity>
      <TouchableOpacity style={s.pendingButton} onPress={() => onSave('pending')}>
        <Text style={s.buttonText}>Terminar más tarde</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { padding: 20, alignItems: 'center', backgroundColor: '#f5f5f5' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 10 },
  image: { width: 100, height: 100, marginBottom: 16, borderRadius: 8 },
  subtitle: { fontSize: 16, fontWeight: '600', color: '#555', alignSelf: 'flex-start', marginBottom: 8 },

  search: {
    width: '100%', backgroundColor: '#fff', borderRadius: 10,
    paddingHorizontal: 12, paddingVertical: 10, borderWidth: 1, borderColor: '#ddd',
    marginBottom: 12,
  },

  section: { width: '100%', backgroundColor: '#fff', borderRadius: 12, marginBottom: 12, overflow: 'hidden', borderWidth: 1, borderColor: '#e5e7eb' },
  sectionHeader: {
    paddingHorizontal: 12, paddingVertical: 12, backgroundColor: '#eef4ff',
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#111827' },
  sectionRight: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  badge: { backgroundColor: '#1f9aef', color: '#fff', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 999, fontWeight: '700' },
  chevron: { fontSize: 16, color: '#111' },
  sectionBody: { paddingHorizontal: 8, paddingVertical: 8 },

  saveButton: { backgroundColor: '#28a745', padding: 12, borderRadius: 8, width: '100%', marginTop: 8, marginBottom: 10 },
  pendingButton: { backgroundColor: '#6c757d', padding: 12, borderRadius: 8, width: '100%' },
  buttonText: { color: '#fff', textAlign: 'center', fontWeight: 'bold' },
});
