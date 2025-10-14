// app/protocolos.js  (o donde lo ubiques en tu app)
// Lista expedientes "saved" y genera el PDF tocando un botón.
// Usa pdf-lib (JS puro) -> NO requiere react-native-html-to-pdf.

import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  Pressable,
  ActivityIndicator,
  Alert,
  StyleSheet,
} from 'react-native';

// ⬇️ Ajusta rutas si tu estructura cambia
import { getSavedRecords } from '../services/database';
import { generateExpedientePdf } from '../services/pdf';

export default function ProtocolosScreen() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);

  // Carga historial de expedientes con status='saved'
  useEffect(() => {
    (async () => {
      try {
        const rows = await getSavedRecords();
        setItems(rows || []);
      } catch (e) {
        console.warn('Historial error', e);
        Alert.alert('Error', 'No se pudo cargar el historial.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const onGenerate = useCallback(async (recordId) => {
    try {
      setBusyId(recordId);
      const file = await generateExpedientePdf(recordId);
      // Opcional: feedback
      console.log('PDF generado en:', file);
    } catch (e) {
      console.warn('PDF error (pdf-lib)', e);
      Alert.alert('Error', 'No se pudo generar el PDF.');
    } finally {
      setBusyId(null);
    }
  }, []);

  const renderItem = ({ item }) => (
    <View style={styles.row}>
      <View style={{ flex: 1 }}>
        <Text style={styles.title}>Expediente #{item.id}</Text>
        <Text style={styles.sub}>
          {(item.gender ? `Género: ${item.gender}` : '')}
          {item.age ? (item.gender ? ' | ' : '') + `Edad: ${item.age}` : ''}
        </Text>
        <Text style={styles.meta}>{item.date} {item.time}</Text>
      </View>

      <Pressable
        onPress={() => onGenerate(item.id)}
        disabled={busyId === item.id}
        style={[styles.btn, busyId === item.id && { opacity: 0.5 }]}
      >
        {busyId === item.id
          ? <ActivityIndicator />
          : <Text style={styles.btnText}>PDF</Text>}
      </Pressable>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerT}>Protocolos / Historial</Text>
        <Text style={styles.headerS}>Toca “PDF” para exportar el expediente completo.</Text>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" />
          <Text style={styles.loading}>Cargando…</Text>
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(it) => String(it.id)}
          renderItem={renderItem}
          contentContainerStyle={items.length ? null : { flex: 1, justifyContent: 'center' }}
          ListEmptyComponent={
            <Text style={styles.empty}>(No hay expedientes con estado saved)</Text>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#ddd',
  },
  headerT: { fontSize: 18, fontWeight: '700' },
  headerS: { color: '#666', marginTop: 2 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#eee',
  },
  title: { fontSize: 16, fontWeight: '600' },
  sub: { color: '#666', marginTop: 2 },
  meta: { color: '#999', marginTop: 2 },
  btn: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#0a7',
    alignSelf: 'center',
  },
  btnText: { color: '#fff', fontWeight: '700' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  loading: { marginTop: 8, color: '#666' },
  empty: { textAlign: 'center', color: '#666' },
});
