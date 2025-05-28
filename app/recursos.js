// app/recursos.js
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { getPendingRecords, setSessionRecordId } from '../services/database';

export default function RecursosScreen() {
  const router = useRouter();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPendingRecords()
      .then(rows => setRecords(rows))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading)
    return <ActivityIndicator style={styles.center} size="large" color="#20b2aa" />;

  if (records.length === 0)
    return (
      <View style={styles.center}>
        <Text style={styles.emptyText}>No hay pendientes por terminar.</Text>
      </View>
    );

  return (
    <FlatList
      style={styles.container}
      data={records}
      keyExtractor={item => item.id.toString()}
      renderItem={({ item }) => (
        <TouchableOpacity
          style={styles.item}
          onPress={() => {
            // fijamos en sesión este ID para que todas las pantallas lo vean
            setSessionRecordId(item.id);
            // navegamos a la pantalla de inicio del flujo
            router.push({
              pathname: '/(tabs)/MedicalRecordScreen',
              params: { recordId: item.id },
            });
          }}
        >
          <Text style={styles.itemText}>
            ID {item.id} – {item.date} {item.time}
          </Text>
        </TouchableOpacity>
      )}
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f5f5f5' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { color: '#666', fontSize: 16 },
  item: {
    padding: 12,
    marginVertical: 6,
    backgroundColor: 'white',
    borderRadius: 8,
    elevation: 2,
  },
  itemText: { fontSize: 16, color: '#333' },
});
