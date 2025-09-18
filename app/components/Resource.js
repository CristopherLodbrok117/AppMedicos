// app/components/Resource.js
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
} from 'react-native';

import HorizontalScrollPicker from '../components/HorizontalScrollPicker';
import CustomButton from './CustomButton';

export default function Resource({ name, quantity = 0, onQuantityChange }) {
  const [showArea, setShowArea] = useState(false);
  const [selectedValue, setSelectedValue] = useState(Number(quantity) || 0);

  // Si la screen recarga datos desde la DB, reflejarlos en el picker
  useEffect(() => {
    setSelectedValue(Number(quantity) || 0);
  }, [quantity]);

  // 🔑 Al cerrar, “commit” al padre para que se guarde en state/DB
  const closeAndCommit = () => {
    const num = Number(selectedValue) || 0;
    onQuantityChange?.(num);    // ← aquí se actualiza quantities en el padre
    setShowArea(false);
  };

  return (
    <View style={styles.container}>
      <CustomButton
        title={name}
        onPress={() => setShowArea(true)}
        fontSize={18}
        padding={9}
        icon="medication"
        iconColor="white"
        iconSize={24}
      />

      <Modal visible={showArea} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{name}</Text>

            <View style={styles.areaArea}>
              <HorizontalScrollPicker
                numbers={Array.from({ length: 201 }, (_, i) => i)} // 0..200
                value={selectedValue}
                onValueChange={(v) => setSelectedValue(Number(v) || 0)}
                itemWidth={80}
                selectedColor="#20b2aa"
              />
            </View>

            <CustomButton
              title="Cerrar"
              onPress={closeAndCommit}              // ← COMMIT AQUÍ
              fontSize={18}
              padding={9}
              icon="medication"
              iconColor="white"
              iconSize={24}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: '100%', marginBottom: 12 },
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center', alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white', padding: 20,
    borderRadius: 15, width: '90%', alignItems: 'center',
  },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  areaArea: { width: '100%', height: 150 },
});
